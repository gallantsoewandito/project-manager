import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create an Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@projecthub.com' },
    update: {},
    create: {
      email: 'admin@projecthub.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create a Normal user
  const user = await prisma.user.upsert({
    where: { email: 'user@projecthub.com' },
    update: {},
    create: {
      email: 'user@projecthub.com',
      name: 'Normal User',
      password: hashedPassword,
      role: 'USER',
    },
  });

  console.log({ admin, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });