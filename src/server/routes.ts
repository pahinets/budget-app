// src/server/routes.ts
import { Express, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from './db';
import { authMiddleware, generateToken, AuthRequest } from './auth';

// These match the Prisma enum values defined in schema.prisma
type CategoryType    = 'income' | 'expense';
type TransactionType = 'income' | 'expense';

const DEFAULT_CATEGORIES: { name: string; type: CategoryType }[] = [
  { name: 'Зарплата',   type: 'income'  },
  { name: 'Фріланс',    type: 'income'  },
  { name: 'Подарунок',  type: 'income'  },
  { name: 'Продукти',   type: 'expense' },
  { name: 'Транспорт',  type: 'expense' },
  { name: 'Житло',      type: 'expense' },
  { name: 'Розваги',    type: 'expense' },
];

export function registerRoutes(app: Express): void {
  // ── Health ──────────────────────────────────────────────────────────────
  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', db_connected: true });
    } catch {
      res.json({ status: 'ok', db_connected: false });
    }
  });

  // ── AUTH ─────────────────────────────────────────────────────────────────
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string };

      if (!email || !password) {
        res.status(400).json({ error: "Email та пароль обов'язкові" });
        return;
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(400).json({ error: 'Користувач вже існує' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          categories: {
            createMany: {
              data: DEFAULT_CATEGORIES,
              skipDuplicates: true,
            },
          },
        },
        select: { id: true, email: true },
      });

      const token = generateToken({ id: user.id, email: user.email });
      res.status(201).json({ token, user });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string };

      if (!email || !password) {
        res.status(400).json({ error: "Email та пароль обов'язкові" });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ error: 'Невірні облікові дані' });
        return;
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        res.status(401).json({ error: 'Невірні облікові дані' });
        return;
      }

      const token = generateToken({ id: user.id, email: user.email });
      res.json({ token, user: { id: user.id, email: user.email } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email обов'язковий" });

      const user = await prisma.user.findUnique({ where: { email } });
      
      if (user) {
        // Використовуємо функцію generateToken, яка вже є у вашому auth.ts
        // Для безпеки зазвичай ставлять менший термін дії, але для тесту підійде стандартний
        const resetToken = generateToken(user); 
        
        // Тут логіка відправки листа. Поки що виводимо в консоль сервера:
        console.log(`[RESET LINK] /reset-password?token=${resetToken}`);
      }

      res.json({ message: "Якщо email є в системі, інструкції надіслано." });
    } catch (e) {
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) return res.status(400).json({ error: "Дані обов'язкові" });

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: number };

      if (!decoded || !decoded.id) {
        return res.status(400).json({ error: 'Недійсний або прострочений токен' });
      }

      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.id },
        data: { passwordHash },
      });

      res.json({ success: true, message: 'Пароль успішно змінено' });
    } catch (e) {
      res.status(400).json({ error: 'Токен недійсний або його термін дії закінчився' });
    }
  });

  app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          currency: true,
          financialPeriod: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'Користувача не знайдено' });
        return;
      }

      // Normalize field name for client compatibility
      res.json({ ...user, financial_period: user.financialPeriod });
    } catch (e) {
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

  app.put('/api/users/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { currency, financial_period } = req.body as {
        currency?: string;
        financial_period?: string;
      };

      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(currency          && { currency }),
          ...(financial_period  && { financialPeriod: financial_period }),
        },
      });

      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

  // ── CATEGORIES ───────────────────────────────────────────────────────────
  app.get('/api/categories', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { type } = req.query as { type?: string };

      const categories = await prisma.category.findMany({
        where: {
          userId: req.user!.id,
          ...(type === 'income' || type === 'expense'
            ? { type: type as CategoryType }
            : {}),
        },
        orderBy: { name: 'asc' },
      });

      res.json(categories);
    } catch (e) {
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

  app.post('/api/categories', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { name, type } = req.body as { name?: string; type?: string };

      if (!name || (type !== 'income' && type !== 'expense')) {
        res.status(400).json({ error: "Назва та тип обов'язкові" });
        return;
      }

      const category = await prisma.category.create({
        data: { name, type: type as CategoryType, userId: req.user!.id },
      });

      res.status(201).json(category);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        res.status(400).json({ error: 'Категорія вже існує' });
        return;
      }
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

  app.delete('/api/categories/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Невірний ID' });
        return;
      }

      const deleted = await prisma.category.deleteMany({
        where: { id, userId: req.user!.id },
      });

      if (deleted.count === 0) {
        res.status(404).json({ error: 'Не знайдено' });
        return;
      }

      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

  // ── TRANSACTIONS ─────────────────────────────────────────────────────────
  app.get('/api/transactions', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const {
        start_date,
        end_date,
        type,
        category_id,
        search,
        sort_by = 'date',
        sort_order = 'DESC',
      } = req.query as Record<string, string | undefined>;

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.user!.id,
          ...(start_date && { date: { gte: new Date(start_date) } }),
          ...(end_date   && { date: { lte: new Date(end_date)   } }),
          ...(start_date && end_date && {
            date: { gte: new Date(start_date), lte: new Date(end_date) },
          }),
          ...(type === 'income' || type === 'expense'
            ? { type: type as TransactionType }
            : {}),
          ...(category_id && !isNaN(parseInt(category_id, 10))
            ? { categoryId: parseInt(category_id, 10) }
            : {}),
          ...(search?.trim()
            ? { description: { contains: search.trim(), mode: 'insensitive' as const } }
            : {}),
        },
        include: {
          category: { select: { name: true } },
        },
        orderBy: {
          [sort_by === 'amount' ? 'amount' : 'date']:
            sort_order === 'ASC' ? 'asc' : 'desc',
        },
      });

      // Flatten category_name for client compatibility
      const result = transactions.map((tx: any) => ({
        ...tx,
        amount: tx.amount.toString(),
        category_name: tx.category?.name ?? null,
        category: undefined,
      }));

      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

  app.post('/api/transactions', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { category_id, amount, type, date, description } = req.body as {
        category_id?: string | number;
        amount?: string | number;
        type?: string;
        date?: string;
        description?: string;
      };

      if (!amount || !type || !date) {
        res.status(400).json({ error: "Сума, тип та дата обов'язкові" });
        return;
      }

      if (type !== 'income' && type !== 'expense') {
        res.status(400).json({ error: 'Невірний тип транзакції' });
        return;
      }

      const transaction = await prisma.transaction.create({
        data: {
          userId:      req.user!.id,
          categoryId:  category_id ? parseInt(String(category_id), 10) : null,
          amount:      parseFloat(String(amount)),
          type:        type as TransactionType,
          date:        new Date(date),
          description: description ?? null,
        },
        include: {
          category: { select: { name: true } },
        },
      });

      res.status(201).json({
        ...transaction,
        amount: transaction.amount.toString(),
        category_name: transaction.category?.name ?? null,
        category: undefined,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });

  app.delete('/api/transactions/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Невірний ID' });
        return;
      }

      const deleted = await prisma.transaction.deleteMany({
        where: { id, userId: req.user!.id },
      });

      if (deleted.count === 0) {
        res.status(404).json({ error: 'Не знайдено' });
        return;
      }

      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });
}
