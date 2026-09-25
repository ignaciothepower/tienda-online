// Webhook de Stripe: Stripe llama a esta URL desde SUS servidores cuando pasa algo (un pago completado).
// Es el UNICO sitio donde un pedido pasa a PAGADO: el cliente puede cerrar el navegador, el webhook llega igual.
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  // 1. El cuerpo EXACTO, como texto: la firma se calcula sobre estos bytes
  const cuerpo = await req.text();
  const firma = req.headers.get("stripe-signature");
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!firma || !secreto) return new Response("Falta la firma o el secreto", { status: 400 });

  // 2. Verificar que el evento viene de Stripe y no de cualquiera que conozca la URL
  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(cuerpo, firma, secreto);
  } catch (e) {
    console.warn("[webhook] firma NO valida:", (e as Error).message);
    return new Response("Firma no valida", { status: 400 });
  }

  // 3. Solo nos interesa el pago completado
  if (evento.type === "checkout.session.completed") {
    const sesion = evento.data.object;
    const pedidoId = Number(sesion.metadata?.pedidoId);

    // updateMany con estado PENDIENTE: si Stripe reenvia el evento, no se procesa dos veces (idempotencia)
    const { count } = await prisma.pedido.updateMany({
      where: { id: pedidoId, estado: "PENDIENTE" },
      data: { estado: "PAGADO", email: sesion.customer_details?.email ?? "sin-email" },
    });

    if (count === 1) {
      // Descontamos el stock de lo vendido
      const lineas = await prisma.lineaPedido.findMany({ where: { pedidoId } });
      for (const l of lineas) {
        await prisma.producto.update({ where: { id: l.productoId }, data: { stock: { decrement: l.cantidad } } });
      }
      console.log(`[webhook] pedido ${pedidoId} PAGADO (${sesion.amount_total} centimos, ${sesion.customer_details?.email})`);
    } else {
      console.log(`[webhook] pedido ${pedidoId} ya estaba procesado: se ignora`);
    }
  }

  // 4. Responder 200 rapido: si no, Stripe reintenta durante dias
  return Response.json({ recibido: true });
}
