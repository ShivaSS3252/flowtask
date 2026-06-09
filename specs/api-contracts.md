# API Contracts — Task Management App

## Base URL

```
http://localhost:3000
```

## Global Response Shape

**Success**
```json
{
  "data": { ... },
  "message": "optional success message"
}
```

**Error**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Authentication

All endpoints except `/auth/*` and `/health` require:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Auth Endpoints

### POST `/auth/register`

Register a new user.

**Request Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 2–50 chars |
| email | string | Yes | valid email format |
| password | string | Yes | min 6 chars |

**Response `201 Created`**
```json
{
  "data": {
    "accessToken": "<jwt>",
    "user": {
      "id": "665f...",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 400 | Validation failure |
| 409 | Email already in use |

---

### POST `/auth/login`

Authenticate an existing user.

**Request Body**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `200 OK`**
```json
{
  "data": {
    "accessToken": "<jwt>",
    "user": {
      "id": "665f...",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 400 | Validation failure |
| 401 | Invalid email or password |
| 429 | Too many attempts (rate limit) |

---

## 2. Task Endpoints

All task endpoints require a valid JWT (`Authorization: Bearer <token>`).

---

### POST `/tasks`

Create a new task.

**Request Body**
```json
{
  "title": "Finish the report",
  "description": "Draft and review by Friday",
  "priority": "high",
  "dueDate": "2024-06-10T00:00:00.000Z"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | Yes | 1–200 chars |
| description | string | No | max 2000 chars |
| priority | `"low"` \| `"medium"` \| `"high"` | No | default: `"medium"` |
| dueDate | ISO 8601 string | No | must be a valid date |

**Response `201 Created`**
```json
{
  "data": {
    "id": "665f...",
    "title": "Finish the report",
    "description": "Draft and review by Friday",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-06-10T00:00:00.000Z",
    "userId": "665f...",
    "createdAt": "2024-06-01T10:00:00.000Z",
    "updatedAt": "2024-06-01T10:00:00.000Z"
  }
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 400 | Validation failure |
| 401 | Missing / invalid token |

---

### GET `/tasks`

Fetch all tasks for the authenticated user.

**Query Parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | `"pending"` \| `"completed"` | — | Filter by status; omit for all |
| priority | `"low"` \| `"medium"` \| `"high"` | — | Filter by priority |
| sort | `"createdAt"` \| `"dueDate"` \| `"priority"` | `"createdAt"` | Sort field |
| order | `"asc"` \| `"desc"` | `"desc"` | Sort direction |

**Example**
```
GET /tasks?status=pending&sort=dueDate&order=asc
```

**Response `200 OK`**
```json
{
  "data": [
    {
      "id": "665f...",
      "title": "Finish the report",
      "description": "...",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-06-10T00:00:00.000Z",
      "userId": "665f...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "count": 1
}
```

---

### GET `/tasks/:id`

Fetch a single task by ID.

**Response `200 OK`** — same shape as single task object above.

**Errors**
| Status | Condition |
|--------|-----------|
| 401 | Missing / invalid token |
| 404 | Task not found or does not belong to user |

---

### PUT `/tasks/:id`

Update a task. All fields are optional (partial update).

**Request Body**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "priority": "low",
  "dueDate": "2024-06-15T00:00:00.000Z"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | No | 1–200 chars |
| description | string | No | max 2000 chars |
| status | `"pending"` \| `"completed"` | No | — |
| priority | `"low"` \| `"medium"` \| `"high"` | No | — |
| dueDate | ISO 8601 string \| null | No | null clears the due date |

**Response `200 OK`** — updated task object.

**Errors**
| Status | Condition |
|--------|-----------|
| 400 | Validation failure |
| 401 | Missing / invalid token |
| 404 | Task not found or does not belong to user |

---

### DELETE `/tasks/:id`

Delete a task permanently.

**Response `200 OK`**
```json
{
  "data": null,
  "message": "Task deleted successfully"
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 401 | Missing / invalid token |
| 404 | Task not found or does not belong to user |

---

## 3. Health Check

### GET `/health`

No authentication required.

**Response `200 OK`**
```json
{
  "status": "ok",
  "timestamp": "2024-06-01T10:00:00.000Z"
}
```

---

## 4. Rate Limiting

Applied via `@nestjs/throttler`:

| Route | Limit |
|-------|-------|
| `POST /auth/login` | 10 requests / 60 seconds per IP |
| `POST /auth/register` | 5 requests / 60 seconds per IP |
| All other routes | 100 requests / 60 seconds per IP |

---

## 5. HTTP Status Code Reference

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation) |
| 401 | Unauthorized (missing/invalid JWT) |
| 403 | Forbidden (authenticated but not owner) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
