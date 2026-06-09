# FlowTask — Task Management App

A full-stack task management application with JWT authentication, built with NestJS, React, TypeScript, and MongoDB.

**Live Demo:** https://flowtask-plum.vercel.app

**API:** https://flowtask-byei.onrender.com

**Video Walkthrough:** [▶ Watch on Loom](https://www.loom.com/share/22db8934749e4d939d6c603f006b50a8)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10, Node.js 18+ |
| Database | MongoDB via Mongoose |
| Auth | JWT (passport-jwt) + bcrypt |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Server state | TanStack React Query v5 |
| Forms | React Hook Form |
| HTTP | Axios |

---

## Features

- JWT authentication — register, login, auto-redirect
- Full task CRUD — create, edit, delete, toggle complete
- Filter by status (All / Pending / Completed)
- Sort by date, due date, or priority
- Debounced live search
- Overdue task detection with visual indicator
- Responsive design — mobile + desktop
- Animated dark amber/gold UI theme

---

## Project Structure

```
flowtask/
├── backend/       NestJS REST API (port 3000)
└── frontend/      React SPA (port 5173)
```

---

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) URI

### 1. Backend

```bash
cd backend

# Mac/Linux
cp .env.example .env

# Windows
copy .env.example .env

# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run start:dev
```

API runs at `http://localhost:3000`

### 2. Frontend

```bash
cd frontend

# Mac/Linux
cp .env.example .env

# Windows
copy .env.example .env

# Edit .env — set VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

### backend/.env

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `FRONTEND_ORIGIN` | Frontend URL for CORS |

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### frontend/.env

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (no trailing slash) |

---

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, receive JWT |
| GET | `/health` | No | Health check |
| POST | `/tasks` | Yes | Create task |
| GET | `/tasks` | Yes | List tasks |
| PUT | `/tasks/:id` | Yes | Update task |
| DELETE | `/tasks/:id` | Yes | Delete task |
