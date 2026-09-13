# Smart Queue Management System (SQM)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.2-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-blue?style=flat-square&logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?style=flat-square&logo=turborepo)](https://turbo.build/)

An enterprise-grade, high-throughput queue orchestrator and dispatch management platform built for municipal service centers, triage health facilities, financial branch operations, and express service counters.

---

## 🏛️ Architecture Overview

The SQM System is architected as a clean Turborepo monorepo designed for performance, modular design, and seamless scalability:

```text
sqm-system/
├── apps/
│   ├── web/               # Next.js 16 App Router + TailwindCSS + Redux Toolkit (RTK Query)
│   └── api/               # Express.js + Drizzle ORM + PostgreSQL (Neon DB) + JWT Authentication
└── packages/
    ├── eslint-config/     # Workspace ESLint rules & code style definitions
    ├── typescript-config/ # Shared TypeScript tsconfig templates
    ├── types/             # Shared TypeScript domain interfaces & validation schemas
    └── ui/                # Shared React UI design system components
```

---

## ✨ Key System Features

### 1. Customer Self-Service Portal (`/`)
- **First-Time Guest Browsing**: Public queue statistics and desk status accessible immediately without forced login.
- **Token Generation**: Instant token assignment with prefix matching (e.g. `A-101`, `B-102`).
- **Live Queue Tracking**: Track token status (`WAITING`, `SERVING`, `COMPLETED`, `SKIPPED`, `CANCELLED`) with estimated wait times.

### 2. Admin & Dispatch Terminal (`/admin/dashboard`)
- **Real-Time Overview**: Live queue volume, waiting counts, parallel service desks, and completion rates.
- **Service Desk Provisioning**: Add, edit, activate/deactivate, and delete service counters with customizable prefixes.
- **Queue Controls**: Call next customer, complete token, skip token, hold queue, or execute **Emergency Pause All**.
- **Role-Based Access Control**: Strict route guarding and JWT cookie validation restricting operational access to authorized administrative accounts.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **State & API Queries** | Redux Toolkit, RTK Query (Automatic Cache Invalidation & Tagging) |
| **Styling & UI** | TailwindCSS, Material Symbols Outlined, Custom Design Tokens |
| **Backend API** | Node.js, Express 5, Zod Schema Validation |
| **Database & ORM** | PostgreSQL (Neon DB), Drizzle ORM, Drizzle Kit Migrations |
| **Security & Auth** | JWT Access & Refresh Tokens, HttpOnly Secure Cookies, CORS, Passwords hashed via Bcrypt |
| **Build & Tooling** | Turborepo, npm Workspaces, TSX |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Neon DB connection URL or local PostgreSQL instance

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/sqm-system.git
   cd sqm-system
   ```

2. **Install Workspace Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create `.env` files in `apps/api` and `apps/web` based on the provided templates:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. **Initialize Database Schema & Seed Data**:
   ```bash
   # From project root
   cd apps/api
   npm run db:push
   npm run db:seed
   cd ../..
   ```

5. **Start Development Servers**:
   ```bash
   npm run dev
   ```
   - **Frontend App**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000`

---

## 🔐 Environment Variables Guide

> ⚠️ **Security Notice**: Never commit real database credentials, JWT secrets, or production keys to version control. Always store sensitive secrets in secure environment variable stores.

### Backend Configurations (`apps/api/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://<username>:<password>@<db-host>/<db-name>?sslmode=require
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
```

### Frontend Configurations (`apps/web/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🌐 Production Deployment (Vercel / Cloud)

### 1. Web Frontend Deployment (`apps/web`)
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: URL of deployed API (e.g. `https://api.yourdomain.com/api`)

### 2. API Backend Deployment (`apps/api`)
- **Root Directory**: `apps/api`
- **Build Command**: `npm run build`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: Production PostgreSQL SSL Connection String
  - `JWT_ACCESS_SECRET`: High-entropy 256-bit secret string
  - `JWT_REFRESH_SECRET`: High-entropy 256-bit secret string
  - `FRONTEND_URL`: Production Web URL (e.g. `https://sqm.yourdomain.com`)

---

## 📄 License & Software Standards

This project is maintained under enterprise software quality standards with automated static analysis, modular monorepo packages, and strict TypeScript verification.
