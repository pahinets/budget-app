// prisma.config.ts  (Prisma 7)
// schema.prisma містить datasource з url=env("DATABASE_URL")
// цей файл лише вказує шлях до схеми
import path from 'node:path';
import { defineConfig } from 'prisma/config';
import process from 'node:process'

try {
  process.loadEnvFile() 
} catch (e) {
  // Silent catch if the file doesn't exist in production
}

export default defineConfig({
	datasource: {
    url: process.env.DATABASE_URL,
  },
  schema: path.join('prisma', 'schema.prisma'),
});


