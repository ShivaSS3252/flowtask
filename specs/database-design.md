# Database Design — Task Management App

## 1. Database: MongoDB

**Database name:** `taskmanager`  
**ODM:** Mongoose (via `@nestjs/mongoose`)

---

## 2. Collections

### 2.1 `users`

Stores registered user accounts.

```
users
├── _id          ObjectId        (auto)
├── name         String          required, trim
├── email        String          required, unique, lowercase, trim
├── password     String          required  (bcrypt hash, never returned)
├── createdAt    Date            auto (timestamps: true)
└── updatedAt    Date            auto (timestamps: true)
```

**Mongoose Schema (TypeScript shape)**

```typescript
{
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
}
// options: { timestamps: true }
```

**Indexes**
| Field | Type | Purpose |
|-------|------|---------|
| `email` | unique | Fast login lookup; prevents duplicate registration |

---

### 2.2 `tasks`

Stores tasks belonging to users.

```
tasks
├── _id          ObjectId        (auto)
├── title        String          required, maxlength: 200
├── description  String          optional, maxlength: 2000, default: ''
├── status       String (enum)   'pending' | 'completed', default: 'pending'
├── priority     String (enum)   'low' | 'medium' | 'high', default: 'medium'
├── dueDate      Date            optional
├── userId       ObjectId        required, ref: 'User'
├── createdAt    Date            auto (timestamps: true)
└── updatedAt    Date            auto (timestamps: true)
```

**Mongoose Schema (TypeScript shape)**

```typescript
{
  title:       { type: String, required: true, maxlength: 200, trim: true },
  description: { type: String, maxlength: 2000, default: '' },
  status:      { type: String, enum: ['pending', 'completed'], default: 'pending' },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate:     { type: Date, default: null },
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
}
// options: { timestamps: true }
```

**Indexes**
| Field | Type | Purpose |
|-------|------|---------|
| `userId` | standard | Efficient fetch of all tasks for a user |
| `userId + status` | compound | Efficient status-filtered queries |
| `userId + createdAt` | compound (desc) | Default sort performance |

---

## 3. Relationships

```
users  ──< tasks
  _id ─────  userId   (1-to-many, embedded foreign key)
```

- One user owns many tasks.
- Tasks are never shared; `userId` is always set on creation from `req.user`.
- Deleting a user should cascade-delete their tasks (service-layer responsibility).

---

## 4. Data Access Patterns

| Operation | Query Shape |
|-----------|-------------|
| Login lookup | `User.findOne({ email })` |
| Get all tasks for user | `Task.find({ userId }).sort({ createdAt: -1 })` |
| Get filtered tasks | `Task.find({ userId, status })` |
| Get single task | `Task.findOne({ _id, userId })` — owner check enforced here |
| Update task | `Task.findOneAndUpdate({ _id, userId }, { ...patch }, { new: true })` |
| Delete task | `Task.findOneAndDelete({ _id, userId })` |

---

## 5. Validation Summary

| Field | Rule |
|-------|------|
| `users.email` | unique index + application-level uniqueness check before insert |
| `users.password` | min 6 chars enforced in DTO before hashing |
| `tasks.title` | required, 1–200 chars |
| `tasks.description` | optional, max 2000 chars |
| `tasks.status` | enum guard in DTO and schema |
| `tasks.priority` | enum guard in DTO and schema |
| `tasks.dueDate` | ISO 8601 date string; parsed to `Date`; optional |

---

## 6. Sample Documents

**User**
```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "$2b$10$...",
  "createdAt": "2024-06-01T10:00:00.000Z",
  "updatedAt": "2024-06-01T10:00:00.000Z"
}
```

**Task**
```json
{
  "_id": "665f1b3c4d5e6f7a8b9c0e1f",
  "title": "Write architecture document",
  "description": "Cover backend, frontend, and DB design",
  "status": "completed",
  "priority": "high",
  "dueDate": "2024-06-05T00:00:00.000Z",
  "userId": "665f1a2b3c4d5e6f7a8b9c0d",
  "createdAt": "2024-06-01T10:05:00.000Z",
  "updatedAt": "2024-06-01T12:00:00.000Z"
}
```
