# Order Tracking System

AI-generated documentation.

A concise overview of the order management and tracking platform (monorepo: NestJS API + Next.js web).

## Highlights

- End-to-end TypeScript with Prisma + PostgreSQL
- JWT auth with protected routes
- Orders, suppliers, forwarders, invoices, and document uploads
- Next.js App Router UI with shadcn/ui + Tailwind

## Tech Stack (Short)

- **Backend**: NestJS, Prisma, PostgreSQL, Passport JWT, Multer
- **Frontend**: Next.js (App Router), React, Tailwind, shadcn/ui
- **Workspace**: pnpm workspaces, Docker Compose for DB

## Project Structure

```
apps/
  api/   # NestJS API
  web/   # Next.js frontend
```

## Core Features

- Orders lifecycle with status tracking
- Supplier & forwarder management
- Invoice creation + document uploads
- Dashboard stats + recent activity

## Quick Start (Local)

1) Install dependencies
```
pnpm install
```

2) Configure environment variables

- apps/api/.env
```
DATABASE_URL="postgresql://app:app@localhost:5432/order_tracking"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
```

- apps/web/.env
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

3) Start database (Docker)
```
docker-compose up -d
```

4) Run migrations & generate Prisma client
```
cd apps/api
pnpm prisma migrate deploy
pnpm prisma generate
```

5) Start dev servers
```
pnpm --filter api dev
pnpm --filter web dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

## API Overview

- Auth: `POST /auth/login`
- Orders: `GET/POST/PATCH/DELETE /orders`
- Invoices: `GET/POST/PATCH/DELETE /invoices`
- Documents: `POST/GET/DELETE /invoices/:id/documents`
- Suppliers: `GET/POST/PATCH/DELETE /suppliers`
- Forwarders: `GET/POST/PATCH/DELETE /forwarders`
- Health: `GET /health`

## Database (Summary)

Main entities: `User`, `Supplier`, `Forwarder`, `Order`, `Invoice`, `InvoiceDocument`.

## File Uploads

Documents are stored on disk in `apps/api/uploads/invoices` with UUID filenames and validated MIME types/size.

## Notes

- For full commands, see commands.md.
- For advanced deployment, check docker-compose.yml and app-specific configs.

## License

MIT