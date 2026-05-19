# Особистий Бюджет — v3.0.0

**Стек:** Express · Prisma 7 · PostgreSQL · esbuild · React 19

## Швидкий старт

### 1. Встановити залежності
```bash
npm install
```

### 2. Налаштувати .env
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
JWT_SECRET="your-secret-key"
```

### 3. Застосувати міграцію БД
```bash
# Для нової БД:
npx prisma migrate deploy

# Або для розробки (генерує нову міграцію якщо треба):
npx prisma migrate dev --name init
```

### 4. Згенерувати Prisma Client
```bash
npx prisma generate
```

### 5. Запуск

**Розробка** (два термінали або один з `concurrently`):
```bash
# Варіант 1 — один термінал
npm run dev

# Варіант 2 — два окремих термінали
npm run dev:server   # термінал 1 — Express на порту 3000
npm run dev:client   # термінал 2 — esbuild watch → public/bundle.js
```

**Продакшн:**
```bash
npm run build   # збирає client + server
npm start       # запускає dist/server.cjs
```

## Структура

```
budget-app-prisma/
├── prisma/
│   ├── schema.prisma          # Моделі БД (без datasource — він у prisma.config.ts)
│   ├── migrations/
│   │   └── 0001_init/
│   │       └── migration.sql
│   └── migration_lock.toml
├── prisma.config.ts           # ← Prisma 7: підключення до БД тут
├── src/
│   ├── server/
│   │   ├── db.ts              # Prisma Client singleton з PrismaPg adapter
│   │   ├── auth.ts            # JWT middleware
│   │   └── routes.ts          # REST API (Prisma ORM замість SQL)
│   ├── pages/                 # React-сторінки
│   ├── components/            # Layout
│   ├── hooks/                 # useAuth, useLanguage
│   └── main.tsx               # esbuild entry point
├── public/
│   ├── index.html
│   ├── styles.css
│   └── bundle.js              # генерується esbuild
└── server.ts                  # Express server
```

## Зміни порівняно з v2

| | v2 | v3 |
|---|---|---|
| Bundler | Vite | esbuild |
| ORM | Сирий SQL (pg) | Prisma 7 |
| БД конфіг | `schema.prisma` | `prisma.config.ts` |
| CSS | Tailwind | CSS custom properties |
