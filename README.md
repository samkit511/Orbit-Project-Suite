# 🚀 Ethara Tasks - Team Task Manager

A premium, full-stack Task Management System designed for high-performance teams. Built with a modern tech stack and focusing on **security (OWASP Top 10)**, **scalability**, and **exceptional UX**.

## ✨ Features

- **🔐 Robust Authentication**: JWT-based auth with secure password hashing and session management.
- **🛡️ Advanced RBAC**: Multi-tier role system (Admin, Manager, Lead, Developer, Intern) with granular permissions.
- **📊 Real-time Analytics**: Dynamic dashboard showing project health, task progress, and overdue alerts.
- **🔗 Professional Routing**: Clean, slug-based URLs for projects (e.g., `/projects/launch-plan`).
- **🛡️ Security First**: Protected against OWASP Top 10 (XSS, SQL Injection, HPP, etc.) using `helmet`, `hpp`, and `zod`.
- **⚡ Optimized Workflow**: Custom setup scripts for lightning-fast local development and deployment.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query (React Query), Lucide Icons.
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: PostgreSQL.
- **DevOps**: Docker (Local), Railway (Production), Nixpacks.

## 🚦 Getting Started

### 1. One-Command Setup
For the first time running the project, use the setup command to install dependencies and prepare the database:
```bash
npm run setup
```

### 2. Local Development
Once setup is complete, start the entire stack (Postgres, Backend, and Frontend) with:
```bash
npm run dev:full
```

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`

## 👥 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Password123` |
| **Developer** | `developer@example.com` | `Password123` |
| **Manager** | `manager@example.com` | `Password123` |

## 🌐 Deployment (Railway Free Tier)

This project is optimized for **Railway's Free Tier** by combining the Backend and Frontend into a single service. This stays within the 2-service limit (Database + App).

### Unified Deployment Steps:
1.  **Provision PostgreSQL**: Create a new project on Railway and add a PostgreSQL instance.
2.  **Deploy from GitHub**: Connect your repository. Railway will detect the root `railway.json` and build both.
3.  **Environment Variables**: Add these to your service:
    - `DATABASE_URL`: Your Railway Postgres connection string.
    - `JWT_SECRET`: A secure random string.
    - `NODE_ENV`: Set to `production`.
    - `VITE_API_URL`: Set to `/api`.

## 📜 License
MIT License. Created for the Ethara Engineering Challenge.
