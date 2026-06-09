# Implementation Plan — Task Management App

## Overview

Sequential phases. Each phase produces working, testable output before the next begins.
No application code is written until specs are approved.

---

## Phase 1 — Backend Scaffold & Auth

**Goal:** A running NestJS server with user registration and login.

### Steps

1. **Initialize NestJS project**
   - `nest new backend --package-manager npm`
   - Install dependencies: `@nestjs/mongoose mongoose @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/config @nestjs/throttler bcrypt class-validator class-transformer`
   - Install dev deps: `@types/bcrypt @types/passport-jwt`

2. **Configure `AppModule`**
   - `ConfigModule.forRoot({ isGlobal: true })`
   - `MongooseModule.forRootAsync(...)` using `MONGODB_URI` from env
   - `ThrottlerModule` global setup

3. **Create `UsersModule`**
   - `User` schema: `name`, `email`, `password`, timestamps
   - `UsersService`: `create()`, `findByEmail()`, `findById()`

4. **Create `AuthModule`**
   - `RegisterDto`, `LoginDto` with `class-validator` decorators
   - `AuthService`: `register()` — hash password, create user; `login()` — validate, sign JWT
   - `JwtStrategy` + `JwtAuthGuard`
   - `AuthController`: `POST /auth/register`, `POST /auth/login`

5. **Global setup in `main.ts`**
   - `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`
   - `app.enableCors({ origin: process.env.FRONTEND_ORIGIN })`
   - `HttpExceptionFilter` global filter

6. **Smoke test**
   - Register → receive JWT ✓
   - Login → receive JWT ✓
   - Login with wrong password → 401 ✓

**Deliverable:** Auth endpoints working, verifiable with Postman/curl.

---

## Phase 2 — Tasks CRUD

**Goal:** Full task CRUD, scoped to the authenticated user.

### Steps

1. **Create `TasksModule`**
   - `Task` schema: all fields from database-design.md
   - Indexes: `userId`, compound `userId+status`

2. **Create DTOs**
   - `CreateTaskDto`: `title` (required), `description`, `priority`, `dueDate`
   - `UpdateTaskDto`: `PartialType(CreateTaskDto)` + optional `status`

3. **`TasksService`**
   - `create(userId, dto)` → returns created task
   - `findAll(userId, filters)` → query with optional status/priority + sort
   - `findOne(userId, id)` → 404 if not found or wrong owner
   - `update(userId, id, dto)` → `findOneAndUpdate` with owner check
   - `remove(userId, id)` → `findOneAndDelete` with owner check

4. **`TasksController`**
   - `@UseGuards(JwtAuthGuard)` on the whole controller
   - Extract `userId` from `@Req() req.user`
   - Map to service calls

5. **TransformInterceptor**
   - Wrap all responses in `{ data, message?, count? }` shape

6. **Health check**
   - `GET /health` endpoint (no auth)

7. **Smoke test all CRUD endpoints**

**Deliverable:** All task API endpoints working and returning consistent response shapes.

---

## Phase 3 — Frontend Scaffold & Auth UI

**Goal:** React app running with login, register, and protected routing.

### Steps

1. **Initialize React project**
   - `npm create vite@latest frontend -- --template react-ts`
   - Install: `axios react-router-dom @tanstack/react-query react-hook-form react-hot-toast`
   - Install: `tailwindcss postcss autoprefixer` + init config

2. **Configure Tailwind**
   - `tailwind.config.js` with `content` paths
   - Import in `index.css`

3. **Axios client**
   - `axiosClient.ts` with `baseURL` from `VITE_API_URL` env var
   - Request interceptor: attach Bearer token
   - Response interceptor: on 401 → clear token, redirect to `/login`

4. **AuthContext**
   - `AuthContext.tsx`: store `user` + `token`, `login()`, `logout()`
   - Persist to `localStorage` on login; restore on app load

5. **Routing**
   - `App.tsx`: `BrowserRouter`, routes for `/login`, `/register`, `/`
   - `ProtectedRoute` wrapper: redirect to `/login` if no token

6. **Login and Register pages**
   - React Hook Form validation
   - API calls via `auth.api.ts`
   - Error display, loading states

7. **Navbar**
   - Show user name, logout button

**Deliverable:** Can register, log in, and be redirected to dashboard. Protected route works.

---

## Phase 4 — Task Management UI

**Goal:** Full dashboard with all task interactions.

### Steps

1. **`tasks.api.ts`**
   - `getTasks(filters?)`, `createTask(dto)`, `updateTask(id, dto)`, `deleteTask(id)`

2. **React Query hooks**
   - `useTasks(filters)` → `useQuery(['tasks', filters], ...)`
   - `useCreateTask()`, `useUpdateTask()`, `useDeleteTask()` mutations
   - Optimistic update in `useUpdateTask` for status toggle

3. **TaskList + TaskCard**
   - Map over query data
   - Status toggle → `useUpdateTask` mutation
   - Strikethrough + dimming for completed
   - Overdue indicator

4. **TaskForm modal**
   - React Hook Form
   - Create mode (no initial values) and edit mode (pre-populated)

5. **TaskFilters**
   - State lifted to Dashboard, passed as filter param to `useTasks`

6. **TaskSearch**
   - Debounced `useState` to filter the cached array client-side

7. **ConfirmDialog**
   - Reusable modal used by delete button

8. **EmptyState**
   - Shown when `tasks.length === 0` after filtering

9. **Toast integration**
   - `<Toaster />` in root; call `toast.success()` / `toast.error()` in mutations

**Deliverable:** Full task CRUD working in the browser, responsive, with all filter/search/sort features.

---

## Phase 5 — Polish & Final Checks

**Goal:** Production-ready presentation.

### Steps

1. **Loading states**
   - Skeleton cards during initial fetch
   - Spinner on submit buttons

2. **Error boundaries**
   - `ErrorBoundary` wrapping the dashboard

3. **Environment files**
   - Backend: `.env.example` with all required vars documented
   - Frontend: `.env.example` with `VITE_API_URL`

4. **README**
   - Setup instructions for both backend and frontend
   - Environment variable documentation
   - How to run locally

5. **Final manual test pass**
   - Register → Login → Create task → Edit → Mark complete → Filter → Delete → Logout
   - Verify 401 handling (expire/remove token manually)
   - Verify responsive layout on narrow viewport

---

## Dependency Graph

```
Phase 1 (Backend Auth)
    │
    ▼
Phase 2 (Backend Tasks)
    │
    ▼
Phase 3 (Frontend Auth)  ←── can start alongside Phase 2 if desired
    │
    ▼
Phase 4 (Frontend Tasks)
    │
    ▼
Phase 5 (Polish)
```

---

## File Creation Order Summary

```
backend/
  src/main.ts
  src/app.module.ts
  src/users/...
  src/auth/...
  src/tasks/...
  src/common/...
  .env / .env.example

frontend/
  src/main.tsx
  src/App.tsx
  src/api/...
  src/context/AuthContext.tsx
  src/hooks/...
  src/pages/...
  src/components/...
  src/types/...
  .env / .env.example
```

---

## Estimated Time

| Phase | Estimated Time |
|-------|----------------|
| Phase 1 — Backend Auth | ~45 min |
| Phase 2 — Backend Tasks | ~30 min |
| Phase 3 — Frontend Auth | ~45 min |
| Phase 4 — Frontend Tasks | ~90 min |
| Phase 5 — Polish | ~30 min |
| **Total** | **~4 hours** |
