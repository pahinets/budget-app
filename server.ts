// server.ts
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { registerRoutes } from './src/server/routes.js';
import { connectDb, disconnectDb } from './src/server/db.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
  const app = express();

  app.use(express.json());

  // ── Connect Prisma ───────────────────────────────────────────────────────
  const connected = await connectDb();
  if (!connected) {
    console.warn('⚠️  База даних недоступна. API-ендпоінти повернуть помилки.');
  }

  // ── Register API routes ──────────────────────────────────────────────────
  registerRoutes(app);

  // ── Serve static frontend ────────────────────────────────────────────────
  // In development, esbuild watches and writes bundle.js to /public
  // In production, files are in /public after build
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));

  // SPA fallback: all non-API routes serve index.html
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  // ── Start listening ──────────────────────────────────────────────────────
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущено: http://localhost:${PORT}`);
    if (isDev) {
      console.log('   Режим розробки — esbuild watch обробляє клієнтський код');
    }
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────
  const shutdown = async () => {
    console.log('\nЗавершення роботи сервера...');
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };

  process.on('SIGINT',  shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((e) => {
  console.error('Критична помилка запуску:', e);
  process.exit(1);
});
