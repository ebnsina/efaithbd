# efaithbd

Online store with a full admin: catalog, orders, coupons, shipping, reviews and Q&A, and every piece of storefront content (pages, FAQs, menus, footer, banners) editable from the admin.

## Stack

TanStack Start (Vite, Nitro) · TanStack Router, Query, Form and Table · Valibot · PostgreSQL with Prisma 7 · shadcn (base-vega, Base UI) · Hugeicons · deployed on Vercel in `sin1`, next to the Neon database.

## Setup

```sh
pnpm install            # also generates the Prisma client
cp .env.example .env    # fill in every value; the app refuses to start without them
pnpm db:deploy          # apply migrations
pnpm create-admin       # create or reset the admin from ADMIN_EMAIL / ADMIN_PASSWORD
pnpm dev                # http://localhost:3000, admin at /auth/admin-login
```

## Commands

- `pnpm build` / `pnpm start` — production build and server
- `pnpm typecheck`, `pnpm lint`, `pnpm format`
- `pnpm db:migrate` — create a migration in development
- `npx tsx src/**/<name>.check.ts` — small runnable checks next to the logic they cover

## Layout

- `src/routes` — file routes; `_shop` is the storefront layout, `admin` the guarded admin
- `src/features/<area>` — server functions (`*.functions.ts`), Valibot schemas, query options and components per area
- `src/server` — server-only code (database, session cookie, uploads)
- `src/components` — shared form kit, data table and shadcn UI
