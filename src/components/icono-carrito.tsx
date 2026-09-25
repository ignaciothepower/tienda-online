// Icono del carrito de la cabecera. De momento estatico: en el paso 4 lo conectamos al store de Zustand.
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function IconoCarrito() {
  return (
    <Link href="/carrito" className="relative" aria-label="Carrito">
      <ShoppingBag className="size-5" />
    </Link>
  );
}
