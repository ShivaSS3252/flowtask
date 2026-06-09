# Environment Variable Strategy

## Principles

1. **No secrets in source control.** `.env` files are git-ignored. Only `.env.example` is committed.
2. **Fail fast.** If a required variable is missing at startup, the app throws immediately — not silently at runtime.
3. **Backend uses `@nestjs/config`.** `ConfigModule` loads `.env` and exposes a typed `ConfigService`.
4. **Frontend uses Vite's `import.meta.env`.** All frontend env vars are prefixed `VITE_`.

---

## Backend — `backend/.env`

```dotenv
# ── Server ────────────────────────────────────────
PORT=3000

# ── Database ──────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/taskmanager

# ── JWT ───────────────────────────────────────────
JWT_SECRET=replace_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d

# ── CORS ──────────────────────────────────────────
FRONTEND_ORIGIN=http://localhost:5173
```

### `backend/.env.example` (committed to git)

```dotenv
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173
```

### Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP server port |
| `MONGODB_URI` | **Yes** | — | Full MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret key for signing JWTs — must be long and random in production |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration (ms string or zeit/ms format) |
| `FRONTEND_ORIGIN` | **Yes** | — | CORS allowed origin — must match the frontend URL exactly |

### NestJS ConfigModule Setup

```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,          // no need to import in every module
  envFilePath: '.env',
  validationSchema: Joi.object({
    PORT:             Joi.number().default(3000),
    MONGODB_URI:      Joi.string().required(),
    JWT_SECRET:       Joi.string().required(),
    JWT_EXPIRES_IN:   Joi.string().default('7d'),
    FRONTEND_ORIGIN:  Joi.string().required(),
  }),
})
```

Validation via `@hapi/joi` ensures the app refuses to start if `MONGODB_URI`, `JWT_SECRET`, or `FRONTEND_ORIGIN` are absent.

### Consuming Variables (backend)

```typescript
// Never use process.env directly — always inject ConfigService
constructor(private config: ConfigService) {}

const secret  = this.config.get<string>('JWT_SECRET');
const mongoUri = this.config.get<string>('MONGODB_URI');
```

---

## Frontend — `frontend/.env`

```dotenv
VITE_API_URL=http://localhost:3000
```

### `frontend/.env.example` (committed to git)

```dotenv
VITE_API_URL=http://localhost:3000
```

### Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | **Yes** | — | Base URL of the NestJS API |

### Consuming Variables (frontend)

```typescript
// axiosClient.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

Vite only exposes variables prefixed with `VITE_` to the browser bundle. Any variable without this prefix is invisible to frontend code — a safety feature that prevents accidental secret exposure.

---

## .gitignore Entries

```gitignore
# root .gitignore
backend/.env
frontend/.env
```

`.env.example` files are intentionally **not** ignored — they document required variables for new developers.

---

## Environment Parity Across Environments

| Variable | Local Dev | Production |
|----------|-----------|------------|
| `MONGODB_URI` | `mongodb://localhost:27017/taskmanager` | MongoDB Atlas URI with credentials |
| `JWT_SECRET` | Any string ≥ 32 chars | Randomly generated, stored in secrets manager |
| `JWT_EXPIRES_IN` | `7d` | `1d` (shorter in prod for tighter security) |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Production frontend domain |
| `VITE_API_URL` | `http://localhost:3000` | Production API domain |
