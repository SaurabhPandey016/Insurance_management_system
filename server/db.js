import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing from environment variables!");
  process.exit(1);
}

// Strip sslmode parameter from the connection string to allow manual SSL options override in pg Pool
const cleanConnectionString = connectionString.replace(/[\?&]sslmode=[^&]+/, '');

// Configure pg connection pool with SSL option to support self-signed certificates
const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export default prisma;
