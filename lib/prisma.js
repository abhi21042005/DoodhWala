import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// On Vercel serverless functions, the root filesystem is read-only except /tmp.
// For zero-setup SQLite demos on Vercel, copy the seeded dev.db to /tmp if needed.
if (process.env.VERCEL && (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dev.db'))) {
  try {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const sourceDb = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, tmpDbPath);
      }
    }
    process.env.DATABASE_URL = 'file:/tmp/dev.db';
  } catch (err) {
    console.error('Failed to prepare SQLite db in /tmp on Vercel:', err);
  }
}

// avoid creating multiple prisma clients in dev (hot reload)
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
