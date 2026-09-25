# Tienda Volta · proyecto Ecommerce

Tienda online de ejemplo del proyecto Ecommerce (Master Desarrollo Agentico, The Power).
Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL (Neon) + Stripe (modo test).

> Estado: **Sesion 1** (cimientos). Catalogo y carrito llegan en la S2, el pago en la S3 y el despliegue en la S4.

## Arrancarlo en local

Necesitas Node.js 20 o superior, una base de datos PostgreSQL (Neon free tier o `docker compose up -d`)
y una cuenta de Stripe en modo test.

```bash
npm install                 # instala dependencias y genera el cliente de Prisma
cp .env.example .env        # y rellena DATABASE_URL, DIRECT_URL y las claves de Stripe
npm run db:check            # comprueba la conexion con la base de datos
npx prisma migrate deploy   # crea las tablas
npm run seed                # 4 categorias y 12 productos de ejemplo
npm run stripe:check        # comprueba las claves de Stripe (no cobra nada)
npm run dev                 # http://localhost:3000
```

## Estructura

```
docs/ESPECIFICACION.md   que hace la tienda (paginas, modelo, reglas)
CLAUDE.md                contexto y convenciones del proyecto
prisma/schema.prisma     modelo de datos: Categoria, Producto, Pedido, LineaPedido
prisma/migrations/       SQL generado por Prisma (va al repositorio)
prisma/seed.ts           datos de ejemplo
src/app/                 paginas (App Router)
src/lib/prisma.ts        instancia unica de Prisma
src/lib/stripe.ts        instancia de Stripe (solo servidor)
scripts/                 comprobaciones de base de datos y Stripe
docker-compose.yml       alternativa local a Neon (opcional)
```

## Reglas del proyecto

1. Precios en centimos (enteros).
2. La clave secreta de Stripe solo vive en el servidor (`src/lib/stripe.ts` lleva `server-only`).
3. El pedido se marca como pagado en el webhook de Stripe, no en la pagina de exito (Sesion 3).
