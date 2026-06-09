# Shared Types Strategy

## Overview

This is a monorepo-style project with two independent packages: `backend/` and `frontend/`. There is no shared npm workspace. Types are **duplicated by design** — each side owns its own type definitions, keeping the two packages fully decoupled and independently deployable.

---

## Why Not a Shared `types/` Package?

| Option | Decision |
|--------|----------|
| Shared npm workspace (`packages/shared`) | Rejected — adds tooling overhead (Turborepo / nx) not justified for this scope |
| Auto-generate frontend types from NestJS DTOs | Rejected — requires `swagger-typescript-api` or OpenAPI setup; adds build complexity |
| Manual duplication | **Chosen** — simple, zero tooling overhead, each side can evolve independently |

The contract between the two sides is enforced by the **api-contracts.md** spec, not by a shared code dependency.

---

## Backend Types (`backend/src/`)

Backend types are expressed as:

### 1. Mongoose Schema Classes (source of truth for DB shape)
```
backend/src/users/schemas/user.schema.ts   → User document shape
backend/src/tasks/schemas/task.schema.ts   → Task document shape
```

### 2. DTOs (source of truth for request/response validation)
```
backend/src/auth/dto/register.dto.ts       → POST /auth/register body
backend/src/auth/dto/login.dto.ts          → POST /auth/login body
backend/src/tasks/dto/create-task.dto.ts   → POST /tasks body
backend/src/tasks/dto/update-task.dto.ts   → PUT /tasks/:id body
```

DTOs use `class-validator` decorators for runtime validation and `class-transformer` for type coercion. They act as the **single source of truth for what the API accepts**.

### 3. Enums (inline in schemas/DTOs)
```typescript
// Defined once in task.schema.ts, imported into DTOs
export enum TaskStatus   { PENDING = 'pending', COMPLETED = 'completed' }
export enum TaskPriority { LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
```

---

## Frontend Types (`frontend/src/types/`)

Frontend types mirror the API response shapes. They are plain TypeScript interfaces — no runtime validation needed here (Axios responses are trusted).

```
frontend/src/types/auth.types.ts    → User, AuthResponse, LoginDto, RegisterDto
frontend/src/types/task.types.ts    → Task, TaskStatus, TaskPriority, CreateTaskDto, UpdateTaskDto
```

### Key interfaces

```typescript
// task.types.ts
export type TaskStatus   = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
}

// auth.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
```

---

## Keeping Backend and Frontend in Sync

Since types are duplicated, the discipline is:

1. **api-contracts.md is the single source of truth.** Any field change starts there.
2. Backend DTO is updated first.
3. Frontend type interface is updated to match.
4. The API response shape is tested manually or via a contract test.

### Change checklist (for any field addition/rename/removal)

```
[ ] Update api-contracts.md
[ ] Update backend DTO (+ schema if DB field)
[ ] Update frontend interface in types/
[ ] Update any affected React Query hooks / API functions
[ ] Update any affected UI components
```

---

## API Response Envelope

The backend wraps all responses in a consistent envelope (via `TransformInterceptor`):

```typescript
// Backend emits:
{ data: T, message?: string, count?: number }

// Frontend unwraps in axiosClient.ts response interceptor:
response.data.data  →  the actual typed payload
```

This means frontend API functions always return the inner `data` value, keeping component code clean.

```typescript
// tasks.api.ts
export const getTasks = async (filters?: TaskFilters): Promise<Task[]> => {
  const res = await api.get<{ data: Task[]; count: number }>('/tasks', { params: filters });
  return res.data.data;
};
```
