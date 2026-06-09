# Architecture Document — Task Management App

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                React + TypeScript + Tailwind CSS             │
│                  Vite SPA  |  React Query                    │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTP/JSON  (Bearer JWT)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    NestJS REST API                           │
│          AuthModule  |  TasksModule  |  UsersModule          │
│                  ValidationPipe  |  JwtGuard                 │
└────────────────────────┬────────────────────────────────────┘
                         │  Mongoose ODM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB                                 │
│              Collections: users, tasks                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Architecture (NestJS)

### 2.1 Module Structure

```
src/
├── app.module.ts               # Root module — wires everything together
├── main.ts                     # Bootstrap, global pipes, CORS
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts      # POST /auth/register, POST /auth/login
│   ├── auth.service.ts         # register(), login(), validateUser()
│   ├── jwt.strategy.ts         # Passport JWT strategy
│   ├── jwt-auth.guard.ts       # Guard applied to protected routes
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
│
├── users/
│   ├── users.module.ts
│   ├── users.service.ts        # findByEmail(), findById(), create()
│   └── schemas/
│       └── user.schema.ts      # Mongoose User schema
│
├── tasks/
│   ├── tasks.module.ts
│   ├── tasks.controller.ts     # CRUD endpoints
│   ├── tasks.service.ts        # Business logic
│   ├── dto/
│   │   ├── create-task.dto.ts
│   │   └── update-task.dto.ts
│   └── schemas/
│       └── task.schema.ts      # Mongoose Task schema
│
└── common/
    ├── filters/
    │   └── http-exception.filter.ts   # Unified error response shape
    └── interceptors/
        └── transform.interceptor.ts   # Wrap responses in { data, ... }
```

### 2.2 Request Lifecycle

```
Incoming Request
     │
     ▼
[Global Middleware]  — CORS, Helmet (optional)
     │
     ▼
[JwtAuthGuard]  — validates Bearer token, attaches req.user
     │
     ▼
[ValidationPipe]  — validates & transforms DTO
     │
     ▼
[Controller]  — thin layer, delegates to service
     │
     ▼
[Service]  — business logic, Mongoose queries
     │
     ▼
[MongoDB via Mongoose]
     │
     ▼
[TransformInterceptor]  — shapes response
     │
     ▼
[HttpExceptionFilter]  — catches errors, returns consistent shape
```

### 2.3 Environment Configuration

All secrets and config via `.env`:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173
```

---

## 3. Frontend Architecture (React + Vite + TypeScript)

### 3.1 Directory Structure

```
src/
├── main.tsx                    # Entry point — providers
├── App.tsx                     # Router setup
│
├── api/
│   ├── axiosClient.ts          # Axios instance with baseURL + auth interceptor
│   ├── auth.api.ts             # login(), register()
│   └── tasks.api.ts            # getTasks(), getTask(), createTask(), updateTask(), deleteTask()
│
├── hooks/
│   ├── useAuth.ts              # Wraps auth context
│   ├── useTasks.ts             # React Query hooks for tasks
│   └── useTaskMutations.ts     # create / update / delete mutations
│
├── context/
│   └── AuthContext.tsx         # JWT storage, user state, login/logout
│
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx        # Used for both create and edit
│   │   ├── TaskFilters.tsx     # All / Pending / Completed tabs
│   │   └── TaskSearch.tsx      # Client-side keyword search
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Spinner.tsx
│       ├── Toast.tsx
│       └── EmptyState.tsx
│
└── types/
    ├── auth.types.ts
    └── task.types.ts
```

### 3.2 State Management Strategy

| Concern | Solution |
|---------|----------|
| Server state (tasks, user) | React Query (`useQuery`, `useMutation`) |
| Auth state (token, user profile) | React Context + localStorage |
| UI state (modal open, filter) | Local `useState` |
| Form state | React Hook Form |

### 3.3 Routing

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/` | DashboardPage | Yes → redirect to `/login` |

---

## 4. Security Considerations

| Concern | Mitigation |
|---------|------------|
| Auth bypass | JWT guard on all `/tasks` routes |
| Cross-user data access | All Mongoose queries filter by `userId` |
| Password exposure | bcrypt hash; never returned in responses |
| Mass assignment | DTOs with `@IsString()`, `@IsOptional()`, `PartialType` — no raw body pass-through |
| Brute force on login | `@nestjs/throttler` rate limiting |
| CORS | Explicit `FRONTEND_ORIGIN` whitelist |
| Token leakage | Token stored in localStorage only; never logged |

---

## 5. Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend framework | NestJS | ^10 |
| Runtime | Node.js | >=18 |
| Database | MongoDB | >=6 |
| ODM | Mongoose via `@nestjs/mongoose` | ^10 |
| Auth | `@nestjs/jwt`, `passport-jwt` | latest |
| Validation | `class-validator`, `class-transformer` | latest |
| Rate limiting | `@nestjs/throttler` | latest |
| Frontend framework | React | ^18 |
| Build tool | Vite | ^5 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^3 |
| HTTP client | Axios | ^1 |
| Server state | TanStack React Query | ^5 |
| Forms | React Hook Form | ^7 |
| Routing | React Router DOM | ^6 |
| Notifications | react-hot-toast | ^2 |
