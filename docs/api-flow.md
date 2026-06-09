# API Flow Diagrams

## 1. NestJS Request Pipeline (All Routes)

Every HTTP request passes through this exact sequence before reaching business logic:

```
Incoming HTTP Request
        │
        ▼
┌─────────────────────────┐
│     CORS Middleware      │  Checks Origin header against FRONTEND_ORIGIN
│                         │  Rejects cross-origin requests from unknown origins
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   ThrottlerGuard        │  Rate-limits by IP
│   (Global)              │  Auth routes: stricter limits
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   JwtAuthGuard          │  Skipped for /auth/* and /health
│   (Route-level)         │  Validates Bearer token via JwtStrategy
│                         │  Attaches req.user = { userId, email }
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   ValidationPipe        │  Transforms plain body → DTO class instance
│   (Global)              │  Runs class-validator decorators
│                         │  Strips unknown properties (whitelist: true)
│                         │  Throws 400 on first validation failure
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Controller Method     │  Thin — extracts params, calls service
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Service Method        │  Business logic + Mongoose queries
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   TransformInterceptor  │  Wraps return value: { data: T, message?, count? }
│   (Global)              │
└───────────┬─────────────┘
            │
            ▼
        HTTP Response

  ── On any thrown exception ──►  HttpExceptionFilter  ──► { statusCode, message, error }
```

---

## 2. Create Task Flow

```
React (TaskForm submit)              NestJS                       MongoDB
────────────────────────────────────────────────────────────────────────

User fills form, clicks "Create"
        │
useCreateTask mutation fires
        │
        │  POST /tasks
        │  Authorization: Bearer <token>
        │  { title, description, priority, dueDate }
        ├────────────────────────────►
        │                             JwtAuthGuard → req.user.userId
        │                             ValidationPipe → CreateTaskDto
        │                             TasksController.create(userId, dto)
        │                             TasksService.create(userId, dto)
        │                                  │
        │                             new Task({ ...dto, userId })
        │                             task.save()
        │                                  │──────────────────────────►
        │                                  │◄── saved Task document
        │                                  │
        │◄────────────────────────────────-┤
        │  201 { data: Task }              │
        │
React Query invalidates ['tasks']
TaskList re-fetches and shows new task
Toast: "Task created"
Modal closes
```

---

## 3. Fetch All Tasks Flow (with filters)

```
React (DashboardPage mounts / filter changes)
────────────────────────────────────────────────────────────────────────

useTasks({ status: 'pending' }) called
React Query checks cache for ['tasks', { status: 'pending' }]
        │
        ├── Cache HIT and not stale (< 30s) → return cached data immediately
        │
        └── Cache MISS or stale
                │
                │  GET /tasks?status=pending
                │  Authorization: Bearer <token>
                ├────────────────────────────►
                │                             JwtAuthGuard → userId
                │                             TasksService.findAll(userId, { status: 'pending' })
                │                             Task.find({ userId, status: 'pending' })
                │                                  .sort({ createdAt: -1 })
                │                                  │
                │◄──────────────────────────────────┤
                │  200 { data: Task[], count: N }    │
                │
        React Query stores in cache
        TaskList renders TaskCards
```

---

## 4. Update Task (Status Toggle) — Optimistic Update Flow

```
React (TaskCard checkbox clicked)
────────────────────────────────────────────────────────────────────────

User clicks checkbox on TaskCard
        │
useUpdateTask mutation fires with { status: 'completed' }
        │
        ├── OPTIMISTIC UPDATE (instant, before API call):
        │   queryClient.setQueryData(['tasks'], (old) =>
        │     old.map(t => t.id === id ? { ...t, status: 'completed' } : t)
        │   )
        │   UI immediately shows task as completed ✓
        │
        │  PUT /tasks/:id
        │  Authorization: Bearer <token>
        │  { status: 'completed' }
        ├────────────────────────────►
        │                             JwtAuthGuard
        │                             ValidationPipe → UpdateTaskDto
        │                             TasksService.update(userId, id, dto)
        │                             Task.findOneAndUpdate(
        │                               { _id: id, userId },
        │                               { status: 'completed' },
        │                               { new: true }
        │                             )
        │◄────────────────────────────┤
        │  200 { data: Task }         │
        │
        React Query confirms — cache stays updated
        Toast: "Task updated"

        ── On API error ──►
        queryClient.setQueryData(['tasks'], previousTasks)  ← rollback
        Toast: "Failed to update task"
```

---

## 5. Delete Task Flow

```
React (TaskCard delete button)
────────────────────────────────────────────────────────────────────────

User clicks Delete
        │
ConfirmDialog opens
        │
User clicks "Delete" in dialog
        │
useDeleteTask mutation fires
        │
        │  DELETE /tasks/:id
        │  Authorization: Bearer <token>
        ├────────────────────────────►
        │                             JwtAuthGuard
        │                             TasksService.remove(userId, id)
        │                             Task.findOneAndDelete({ _id: id, userId })
        │                                  │──────────────────────────►
        │                                  │◄── deleted document (or null)
        │                                  │
        │                             null → throw NotFoundException
        │◄────────────────────────────┤
        │  200 { data: null,          │
        │         message: "Task deleted successfully" }
        │
React Query invalidates ['tasks']
TaskList re-fetches (task is gone)
Toast: "Task deleted"
```

---

## 6. Global Error Response Shape

All errors — whether from guards, pipes, or services — pass through `HttpExceptionFilter` and return:

```json
{
  "statusCode": 404,
  "message": "Task not found",
  "error": "Not Found"
}
```

Frontend handles errors at two levels:

| Level | Handler | Action |
|-------|---------|--------|
| 401 Unauthorized | Axios response interceptor | Clear token → redirect to `/login` |
| All other errors | React Query `onError` callback | Show toast with `error.response.data.message` |

---

## 7. Cross-Cutting: User Ownership Enforcement

Every task service method enforces ownership by including `userId` in the Mongoose query:

```
TasksService.findOne(userId, taskId)
  └── Task.findOne({ _id: taskId, userId: userId })
            │
            ├── document found    → return it
            └── null              → throw NotFoundException("Task not found")
```

This means even if an attacker sends a valid JWT with their own `userId` and guesses another user's task `_id`, the query returns `null` and they get a 404 — not a 403. This intentionally does not reveal whether the task exists.
