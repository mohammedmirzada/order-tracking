pnpm --filter api exec prisma migrate dev --name init
pnpm --filter api exec prisma generate

pnpm --filter api exec prisma studio
pnpm approve-builds