// Catalogo (Server Component): los productos se leen de la base de datos en el servidor.
import { TarjetaProducto } from "@/components/tarjeta-producto";
import { buscarProductos } from "@/lib/catalogo";

export const dynamic = "force-dynamic";

export default async function Catalogo() {
  const productos = await buscarProductos({ q: "", categoria: "", min: null, max: null });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Catalogo</h1>
      <p className="mt-1 text-muted-foreground">{productos.length} productos</p>
      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {productos.map((p) => (
          <TarjetaProducto key={p.id} producto={p} />
        ))}
      </div>
    </main>
  );
}
