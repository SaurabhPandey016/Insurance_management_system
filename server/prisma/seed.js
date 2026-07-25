import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

let connectionString = process.env.DIRECT_URL;
if (!connectionString) {
  console.error("DIRECT_URL environment variable is missing!");
  process.exit(1);
}

// Strip sslmode query param to avoid pg overriding the custom SSL configuration
connectionString = connectionString.replace(/[\?&]sslmode=[^&]+/, '');

console.log("Connecting to:", connectionString.replace(/:[^:@]+@/, ':****@')); // Print masked URL

const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database starting...');

  // 1. Seed Policy Types
  console.log('Seeding policy types...');
  const policyTypes = [
    {
      name: 'Health Insurance',
      description: 'Comprehensive medical and health protection, including hospitalization, medicines, and diagnostic fees.',
      basePremium: 150.00,
      coverageLimit: 50000.00,
      termsMonths: 12,
    },
    {
      name: 'Auto Insurance',
      description: 'Full motor vehicle insurance safeguarding against crashes, physical damage, third-party liability, and vehicle theft.',
      basePremium: 80.00,
      coverageLimit: 25000.00,
      termsMonths: 12,
    },
    {
      name: 'Life Insurance',
      description: 'Long-term security protecting families, providing comprehensive death benefits and disability cover.',
      basePremium: 200.00,
      coverageLimit: 100000.00,
      termsMonths: 12,
    },
    {
      name: 'Home Insurance',
      description: 'Asset protection covering natural disasters, residential damage, fire breakout, and residential break-ins.',
      basePremium: 120.00,
      coverageLimit: 75000.00,
      termsMonths: 12,
    },
  ];

  for (const pt of policyTypes) {
    await prisma.policyType.upsert({
      where: { name: pt.name },
      update: pt,
      create: pt,
    });
  }
  console.log('Policy types seeded successfully.');

  // 2. Seed Admin User
  console.log('Seeding admin user...');
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@insurance.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@insurance.com',
      password: adminPassword,
      role: 'ADMIN',
      name: 'Saurabh Admin',
      phone: '9876543210',
    },
  });
  console.log('Admin user seeded.');

  // 3. Seed Agent User & Profile
  console.log('Seeding agent user and profile...');
  const agentPassword = await bcrypt.hash('Agent@123', 10);
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@insurance.com' },
    update: { password: agentPassword },
    create: {
      email: 'agent@insurance.com',
      password: agentPassword,
      role: 'AGENT',
      name: 'Saurabh Agent',
      phone: '8765432109',
    },
  });

  await prisma.agentProfile.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      agentCode: 'AGT-100001',
      department: 'Retail Insurance Sales',
      status: 'ACTIVE',
    },
  });
  console.log('Agent user and profile seeded.');

  // 4. Seed Customer User & Profile
  console.log('Seeding customer user and profile...');
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@insurance.com' },
    update: { password: customerPassword },
    create: {
      email: 'customer@insurance.com',
      password: customerPassword,
      role: 'CUSTOMER',
      name: 'Saurabh Customer',
      phone: '7654321098',
    },
  });

  await prisma.customerProfile.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      address: '123 Main Street, Sector 4, Bangalore, Karnataka',
      dob: new Date('1995-05-15'),
      agentId: agentUser.id, // Linked to seeded agent
    },
  });
  console.log('Customer user and profile seeded.');

  console.log('Seeding database completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
