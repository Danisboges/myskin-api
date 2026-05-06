const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

const adapter = new PrismaPg(pool);

// Di Prisma 7, URL dilewatkan melalui adapter ini
const prisma = new PrismaClient({ adapter });

module.exports = prisma;