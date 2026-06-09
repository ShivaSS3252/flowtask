# Product Requirements Document — Task Management App

## 1. Overview

A web-based task management application enabling authenticated users to create, organize, and track personal tasks through a clean, responsive interface. The system consists of a REST API backend and a React SPA frontend.

---

## 2. Goals

| Goal | Description |
|------|-------------|
| G1 | Users can register and log in securely |
| G2 | Authenticated users can manage their own tasks (CRUD) |
| G3 | Tasks can be filtered by status |
| G4 | The UI is responsive and works on mobile and desktop |
| G5 | The system is production-ready in structure and security posture |

---

## 3. Personas

**Primary User — Individual contributor**
- Needs a simple way to track daily tasks
- Uses the app on both desktop and mobile
- Expects instant feedback on actions (optimistic updates)

---

## 4. Functional Requirements

### 4.1 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-1 | User can register with name, email, and password | Must |
| AUTH-2 | User can log in with email and password | Must |
| AUTH-3 | JWT is issued on login and stored client-side (localStorage) | Must |
| AUTH-4 | JWT is attached as Bearer token on every authenticated request | Must |
| AUTH-5 | User can log out (token cleared client-side) | Must |
| AUTH-6 | Password is hashed with bcrypt before storage | Must |
| AUTH-7 | Duplicate email registration returns a clear error | Must |
| AUTH-8 | Expired/invalid tokens return 401; frontend redirects to login | Must |

### 4.2 Task Management

| ID | Requirement | Priority |
|----|-------------|----------|
| TASK-1 | Create a task with title (required), description (optional), status (default: pending) | Must |
| TASK-2 | Fetch all tasks belonging to the authenticated user | Must |
| TASK-3 | Fetch a single task by ID (must belong to user) | Must |
| TASK-4 | Update task title, description, and/or status | Must |
| TASK-5 | Delete a task | Must |
| TASK-6 | Mark a task as completed (status toggle) | Must |
| TASK-7 | Filter tasks by status: All / Pending / Completed | Must |
| TASK-8 | Tasks are scoped to the owning user; no cross-user access | Must |
| TASK-9 | Task list is sorted by creation date descending by default | Should |
| TASK-10 | Task title has a max length of 200 characters | Should |
| TASK-11 | Task description has a max length of 2000 characters | Should |

### 4.3 UI / UX

| ID | Requirement | Priority |
|----|-------------|----------|
| UI-1 | Login and Register pages | Must |
| UI-2 | Task dashboard showing task list | Must |
| UI-3 | Inline or modal form to add a new task | Must |
| UI-4 | Edit task inline or via modal | Must |
| UI-5 | Delete task with a confirmation prompt | Must |
| UI-6 | Status filter tabs/buttons (All / Pending / Completed) | Must |
| UI-7 | Empty state message when no tasks match the filter | Should |
| UI-8 | Loading skeletons / spinners during API calls | Should |
| UI-9 | Toast notifications for success and error feedback | Should |
| UI-10 | Responsive layout using Tailwind CSS | Must |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | API response time < 300 ms for typical operations on local/dev |
| NFR-2 | Passwords never stored or logged in plain text |
| NFR-3 | All API routes (except auth) protected by JWT guard |
| NFR-4 | CORS configured to allow only the frontend origin |
| NFR-5 | Input validated at both API and frontend layers |
| NFR-6 | Environment variables used for all secrets and config |
| NFR-7 | No sensitive data (tokens, passwords) logged to console in production |

---

## 6. Out of Scope

- Email verification / password reset flow
- Multi-user collaboration or task sharing
- File attachments
- Notifications / reminders
- Role-based access control beyond "owner"
- Pagination (the assignment does not require it; assumed manageable data size)

---

## 7. Assumptions & Decisions

| # | Assumption |
|---|------------|
| A1 | JWT stored in localStorage (assignment allows this; simpler for SPA demo) |
| A2 | Task `status` is an enum: `pending` \| `completed` |
| A3 | Each task has a `priority` field (low/medium/high) |
| A4 | MongoDB Atlas or local MongoDB acceptable |
| A5 | NestJS chosen as backend framework |
| A6 | React + Vite + TypeScript chosen for the frontend |
