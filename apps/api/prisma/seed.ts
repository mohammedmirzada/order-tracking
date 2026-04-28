import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing in .env');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const email = 'admin@lionsfortco.com';
  const password = 'admin123';

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hashed, name: 'Admin', role: 'ADMIN' },
  });

  console.log('User ready:', user.email, '/ password:', password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
