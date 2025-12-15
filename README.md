# Snippets Hub

Snippets Hub is a full-stack web application designed to organize, manage and share code snippets efficiently.  
It supports authentication, workspaces, and a clean dashboard experience, all fully dockerized.

## 🚀 Tech Stack

**Frontend**
- React
- Context API
- CSS

**Backend**
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT Authentication

**Infrastructure**
- Docker
- Docker Compose
- Nginx

---

## ✨ Features

- User authentication (register / login)
- JWT access & refresh tokens
- Workspace-based snippet organization
- Create, edit, delete and restore snippets
- Trash system
- Public snippets support
- Secure API with middleware
- Full Dockerized environment

## ⚙️ Environment Setup

Create environment files from the examples:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

🐳 Run with Docker

Make sure you have Docker and Docker Compose installed.
docker compose up --build
Frontend: http://localhost:3000

Backend API: http://localhost:5000

🔐 Authentication

The backend uses:

Access tokens (short-lived)

Refresh tokens (stored in HTTP-only cookies)

JWT secrets and token expiration values are configurable via environment variables.

🧪 Database & Prisma

Run migrations inside the backend container if needed:

docker compose exec backend npx prisma migrate deploy



