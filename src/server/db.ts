// src/server/db.ts  (Prisma 7 + @prisma/adapter-pg)
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL не задано у .env файлі');
  }

  // Prisma 7 вимагає передачі driver-адаптера у конструктор
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  } as any); // "as any" бо типи адаптера ще у preview у @prisma/client 7
}

// Singleton для уникнення зайвих з'єднань у dev-режимі (hot reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function connectDb(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Prisma підключено до PostgreSQL');
    return true;
  } catch (e) {
    console.error('❌ Помилка підключення Prisma:', e);
    return false;
  }
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
