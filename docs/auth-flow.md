# Authentication Flow Diagrams

## 1. Registration Flow

```
Browser (React)                     NestJS API                    MongoDB
──────────────────────────────────────────────────────────────────────────

User fills Register form
        │
        │  POST /auth/register
        │  { name, email, password }
        ├──────────────────────────►
        │                           ValidationPipe
        │                           checks DTO rules
        │                                │
        │                           UsersService.findByEmail(email)
        │                                │──────────────────────────►
        │                                │◄── null (not found)
        │                                │
        │                           bcrypt.hash(password, 10)
        │                                │
        │                           UsersService.create(...)
        │                                │──────────────────────────►
        │                                │◄── saved User document
        │                                │
        │                           JwtService.sign({ sub: user._id })
        │                                │
        │◄───────────────────────────────┤
        │  201 { accessToken, user }     │
        │                                │
Store token in localStorage
Set user in AuthContext
Navigate to /
```

**Duplicate email path:**
```
        │  POST /auth/register (email already exists)
        ├──────────────────────────►
        │                           UsersService.findByEmail(email)
        │                                │──────────────────────────►
        │                                │◄── User document found
        │                                │
        │                           throw ConflictException
        │◄───────────────────────────────┤
        │  409 { message: "Email already in use" }
        │
Show inline error on form
```

---

## 2. Login Flow

```
Browser (React)                     NestJS API                    MongoDB
──────────────────────────────────────────────────────────────────────────

User fills Login form
        │
        │  POST /auth/login
        │  { email, password }
        ├──────────────────────────►
        │                           ValidationPipe checks DTO
        │                                │
        │                           UsersService.findByEmail(email)
        │                                │──────────────────────────►
        │                                │◄── User document
        │                                │
        │                           bcrypt.compare(password, user.password)
        │                                │
        │                           ✓ match → JwtService.sign(payload)
        │◄───────────────────────────────┤
        │  200 { accessToken, user }     │
        │
Store token in localStorage
Set user in AuthContext
Navigate to /
```

**Wrong credentials path:**
```
        │  POST /auth/login (bad password)
        ├──────────────────────────►
        │                           bcrypt.compare → false
        │                           throw UnauthorizedException
        │◄───────────────────────────────┤
        │  401 { message: "Invalid credentials" }
        │
Show error message below form
```

---

## 3. Authenticated Request Flow

```
Browser (React)                     NestJS API                    MongoDB
──────────────────────────────────────────────────────────────────────────

axiosClient request interceptor
reads token from localStorage
adds header:
  Authorization: Bearer <token>
        │
        │  GET /tasks
        │  Authorization: Bearer eyJ...
        ├──────────────────────────►
        │                           JwtAuthGuard
        │                           JwtStrategy.validate(payload)
        │                                │
        │                           ✓ valid → req.user = { userId, email }
        │                                │
        │                           TasksController.findAll(req.user)
        │                                │
        │                           TasksService.findAll(userId, filters)
        │                                │──────────────────────────►
        │                                │  Task.find({ userId })
        │                                │◄── Task[]
        │                                │
        │                           TransformInterceptor wraps response
        │◄───────────────────────────────┤
        │  200 { data: Task[], count: N }│
        │
React Query caches result
TaskList renders cards
```

**Expired / invalid token path:**
```
        │  GET /tasks (expired token)
        ├──────────────────────────►
        │                           JwtStrategy.validate → throws
        │                           JwtAuthGuard returns 401
        │◄───────────────────────────────┤
        │  401 Unauthorized              │
        │
axiosClient response interceptor
detects 401
clears localStorage token
clears AuthContext
navigate('/login')
```

---

## 4. Logout Flow

```
Browser (React)
──────────────────────────────────────

User clicks Logout button
        │
        ▼
AuthContext.logout()
  ├── localStorage.removeItem('token')
  ├── setUser(null)
  └── setToken(null)
        │
        ▼
React Router navigate('/login')

[No API call required — JWT is stateless.
 Token simply stops being sent with requests.]
```

---

## 5. App Load / Token Restore Flow

```
Browser (React) — on initial page load
──────────────────────────────────────────────────────────────

App mounts
        │
        ▼
AuthContext initializes
  ├── token = localStorage.getItem('token')
  │
  ├── token exists?
  │       ├── YES
  │       │     ├── Decode payload (jwt-decode, no verify — server verifies on each request)
  │       │     ├── setToken(token)
  │       │     ├── setUser({ id, name, email } from payload)
  │       │     └── render protected routes normally
  │       │
  │       └── NO
  │             └── ProtectedRoute redirects to /login
  │
  └── Any subsequent 401 from API
        └── response interceptor clears token → /login
```

---

## 6. JWT Token Structure

```
Header:  { alg: "HS256", typ: "JWT" }
Payload: { sub: "<userId>", email: "<email>", iat: <timestamp>, exp: <timestamp> }
Signature: HMACSHA256(base64Header + "." + base64Payload, JWT_SECRET)
```

- `sub` is the MongoDB `_id` string of the user
- `exp` is `iat + JWT_EXPIRES_IN` (default 7 days)
- The payload is **not encrypted** — never put sensitive data in it
- `JWT_SECRET` is only known to the server — signatures cannot be forged without it
