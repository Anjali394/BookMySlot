require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const email = 'anjalirajput394@gmail.com';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('Admin user already exists:', email);
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.create({
    data: { name: 'Admin Anjali', email, passwordHash, role: 'ADMIN' },
  });

  console.log('Admin user created:', admin.email);
  await prisma.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
