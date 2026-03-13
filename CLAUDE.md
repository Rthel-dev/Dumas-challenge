# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo with two independent applications:

- `backend/` — NestJS 11 REST API with Prisma ORM + PostgreSQL
- `frontend/` — Angular 20 SPA (standalone/signal-based, zoneless)

Each app has its own `package.json` and `node_modules/`. Commands must be run from the respective subdirectory.

## Setup After Clone

```bash
# Backend: install deps and regenerate Prisma client (generated/ is gitignored)
cd backend && npm install && npx prisma generate
```

## Commands

### Backend (`cd backend/`)

```bash
npm run start:dev     # Watch mode, port 3000
npm run build         # Compile TypeScript to dist/
npm run start:prod    # Run compiled app (node dist/main)
npm run lint          # ESLint with auto-fix
npm run format        # Prettier formatting
npm test              # Unit tests (Jest) — test files in src/**/*.spec.ts
npm run test:watch    # Jest watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests — test files in test/**/*.e2e-spec.ts
```

Run a single test file:
```bash
npx jest src/path/to/file.spec.ts
```

### Frontend (`cd frontend/`)

```bash
npm start             # Dev server on port 4200 (ng serve)
npm run build         # Production build to dist/
npm test              # Unit tests (Karma + Jasmine)
npm run watch         # Watch mode build
```

### Prisma (`cd backend/`)

```bash
npx prisma migrate dev        # Run migrations in development
npx prisma migrate deploy     # Apply migrations in production
npx prisma generate           # Regenerate Prisma client to generated/prisma/
npx prisma studio             # Open DB GUI
```

## Architecture

### Backend

- **Entry point**: `src/main.ts` — bootstraps NestJS, listens on `process.env.PORT ?? 3000`
- **Module pattern**: NestJS modules with controllers and services injected via DI
- **Database**: Prisma 7 with `@prisma/adapter-pg` (native PostgreSQL driver). Schema at `prisma/schema.prisma`, client generated to `generated/prisma/` (gitignored). Config in `prisma.config.ts`.
- **Prisma client instantiation**: Must use the `pg` adapter — `new PrismaClient({ adapter: new PrismaPg(pool) })`. Do not instantiate `PrismaClient` without the adapter.
- **Environment**: `.env` defines individual vars (`DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`) composed into `DATABASE_URL`. Format: `postgresql://user:pass@host:port/dbname?schema=public`

### Frontend

- **Modern Angular**: Uses standalone components (no NgModules), signal-based change detection (zoneless), SCSS styles
- **Entry point**: `src/main.ts` bootstraps `AppComponent` with `provideRouter(routes)`
- **Routing**: Defined in `src/app/app.routes.ts`

## Code Style

- **Backend**: Single quotes, trailing commas (enforced by Prettier + ESLint). TypeScript strict mode. ESLint uses flat config format (`eslint.config.mjs`, ESLint 9+).
- **Frontend**: TypeScript strict mode, SCSS for styles.
- **Commits**: Prefix with scope, e.g. `API:` for backend, `SPA:` for frontend.
