// Pagina inicial provisional (Sesion 1): comprueba que la app lee la base de datos.
// Es un Server Component: la consulta a Prisma se ejecuta en el servidor y al navegador
// solo llega el HTML. En la Sesion 2 la convertimos en el catalogo de verdad (shadcn/ui).
import { prisma } from "@/lib/prisma";
import { formatearPrecio } from "@/lib/formato";

export const dynamic = "force-dynamic"; // siempre datos frescos de la BD

// Comprobacion en el servidor: la clave secreta se usa aqui y nunca viaja al navegador
async function estadoStripe(): Promise<string> {
  try {
    const { stripe } = await import("@/lib/stripe");
    const saldo = await stripe.balance.retrieve();
    return saldo.livemode ? "Stripe conectado (LIVE)" : "Stripe conectado (modo test)";
  } catch (e) {
    return `Stripe sin configurar: ${(e as Error).message}`;
  }
}

export default async function Inicio() {
  const [categorias, stripe] = await Promise.all([
    prisma.categoria.findMany({
      include: { productos: { orderBy: { precio: "asc" } } },
      orderBy: { id: "asc" },
    }),
    estadoStripe(),
  ]);
  const total = categorias.reduce((n, c) => n + c.productos.length, 0);

  return (
    <main className="mx-auto max-w-5xl p-10 font-sans">
      <h1 className="text-3xl font-bold">Tienda Volta</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Sesion 1 · {total} productos leidos de PostgreSQL (Neon) con Prisma
      </p>
      <p
        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
          stripe.startsWith("Stripe conectado") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {stripe}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {categorias.map((c) => (
          <section key={c.id} className="rounded-xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">{c.nombre}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {c.productos.map((p) => (
                <li key={p.id} className="flex justify-between gap-4">
                  <span>{p.nombre}</span>
                  <span className={p.stock === 0 ? "text-red-600" : "font-mono"}>
                    {p.stock === 0 ? "agotado" : formatearPrecio(p.precio)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
