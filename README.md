# SQM System (Smart Queue Management)

SQM System is a high-throughput queue orchestrator and dispatch management platform built for municipal centers, multi-specialty triage clinics, and express service counters.

## Project Architecture

This project is structured as a Turborepo monorepo:

```text
sqm-system/
├── apps/
│   ├── web/           # Next.js 16 App Router + TailwindCSS + Redux Toolkit (RTK Query)
│   └── api/           # Express API + Drizzle ORM + PostgreSQL (Neon) + JWT Auth
└── packages/
    ├── eslint-config/ # Monorepo ESLint configurations
    ├── typescript-config/ # Shared TSConfig
    ├── types/         # Shared TypeScript interfaces & types
    └── ui/            # Shared React UI components
```

---

## Features

- **Customer Portal**: Self-service token generation, real-time position tracking, live wait-time estimates.
- **Operator Console**: Desk queue management, token triage, call next, hold, and completion dispatch.
- **Admin Dashboard**: System-wide performance metrics, counter configuration, throughput analytics.
- **Secure Authentication**: JWT-based session cookies with HttpOnly & SameSite security.
- **Cloud Database**: Serverless PostgreSQL via Neon DB and Drizzle ORM.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, Redux Toolkit Query
- **Backend**: Node.js, Express, Drizzle ORM, PostgreSQL (Neon DB), Zod validation
- **Monorepo Tools**: Turborepo, npm Workspaces

---

## Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in `apps/api` and `apps/web`:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. **Run Database Migrations & Seed**:
   ```bash
   cd apps/api
   npm run db:push
   npm run db:seed
   cd ../..
   ```

4. **Start Development Servers**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

---

## Environment Variables

### Frontend (`apps/web/.env`)
- `NEXT_PUBLIC_API_URL`: Express API endpoint (e.g. `http://localhost:5000/api` or deployed API URL)

### Backend (`apps/api/.env`)
- `PORT`: Port number (default `5000`)
- `NODE_ENV`: Runtime environment (`development` | `production`)
- `FRONTEND_URL`: Allowed CORS origin (e.g. `http://localhost:3000` or deployed frontend URL)
- `DATABASE_URL`: PostgreSQL connection string (Neon DB)
- `JWT_ACCESS_SECRET`: Secret key for JWT access tokens
- `JWT_REFRESH_SECRET`: Secret key for JWT refresh tokens
- `CLOUDINARY_*`: Cloudinary credentials (optional)
- `EMAIL_*`: SMTP/Email credentials (optional)

---

## Vercel Deployment Instructions

1. **Frontend (`apps/web`)**:
   - Set **Root Directory** to `apps/web`.
   - Add Environment Variable:
     - `NEXT_PUBLIC_API_URL` = `<your-backend-api-url>`

2. **Backend (`apps/api`)**:
   - Set **Root Directory** to `apps/api`.
   - Add Environment Variables:
     - `DATABASE_URL` = `<your-neon-db-url>`
     - `JWT_ACCESS_SECRET` = `<your-jwt-secret>`
     - `FRONTEND_URL` = `<your-frontend-vercel-url>`
     - `NODE_ENV` = `production`
