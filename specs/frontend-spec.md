# Frontend Specification — FlowTask

## 1. Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| **Tailwind CSS v4** | Utility-first styling (`@tailwindcss/vite` plugin, no config file) |
| React Router DOM v6 | Client-side routing |
| TanStack React Query v5 | Server state, caching, mutations |
| Axios | HTTP client |
| React Hook Form | Form state and validation |
| react-hot-toast | Toast notifications |

---

## 2. Design System — Amber/Gold Dark Theme

**Body background:** `#0c0a06` with amber radial gradients (fixed attachment)

| Token | Value |
|-------|-------|
| Primary amber | `#d97706`, `#b45309`, `#92400e` |
| Amber bright | `#fbbf24`, `#f59e0b` |
| Text primary | `#fef3c7`, `#f5f0e8` |
| Text muted | `#a8a29e`, `#78716c`, `#57534e` |
| Border subtle | `rgba(251,191,36,0.15)` |
| Card bg | `rgba(255,255,255,0.04)` |

**CSS classes** defined in `src/index.css`:
- `.input-base` — dark input with amber focus ring
- `.btn-primary` — amber gradient button with glow
- `.btn-secondary` — ghost amber border button
- `.btn-danger` — red button
- `.btn-ghost` — transparent button, visible on hover
- `.card`, `.glass` — dark glassmorphism containers
- `.badge-high/medium/low` — priority pill badges

**Note:** All theme colors use inline styles, not Tailwind classes, to avoid class generation issues with v4.

---

## 3. Pages

### 3.1 Login Page (`/login`)

**Layout:** Split — left branding panel (hidden on mobile) + right form panel

**Left panel (`hidden lg:flex lg:w-1/2`, overflow-hidden, no scroll):**
- Animated amber glow orbs
- FlowTask logo
- Tagline: "Stop thinking. Start doing."
- Feature list (3 items with amber icon badges)
- Bottom quote (Mark Twain)

**Right panel (`w-full lg:w-1/2`, scrollable):**
- Email input
- Password input with eye toggle (show/hide)
- Sign in button
- Link to Register

---

### 3.2 Register Page (`/register`)

**Layout:** Same split as Login

**Left panel:**
- Animated amber glow orbs
- FlowTask logo
- Tagline: "Your goals. Your timeline."
- 3 stats: 10x / 0 / 100%
- Bottom quote (Antoine de Saint-Exupery)

**Right panel:**
- Icon badge + "Create account" heading
- Full name, email inputs
- Password input with eye toggle
- Confirm password input with eye toggle
- "Create account" button with user-plus icon
- Link to Login

---

### 3.3 Dashboard Page (`/`)

**Layout:** Navbar + main content (`max-w-4xl` centered)

**Sections:**
- Stat cards: Total / Pending / Completed (amber bordered)
- Amber gradient progress bar with glow
- Search bar
- Filter tabs (All / Pending / Completed) + Sort by dropdown
- Task list or EmptyState

---

## 4. Components

### Navbar
- Left: clipboard logo + "FlowTask" gradient text
- Right: user avatar (amber initial circle) + logout button
- Sticky top, dark glassmorphism background

### TaskCard
- Left priority accent bar (colored by priority)
- Amber checkbox when completed (with glow)
- Title strikethrough + dimmed when completed
- Priority badge, overdue date in red
- Edit (pencil) + Delete (trash) icon buttons — faint at rest (`opacity: 0.35`), full on hover
- Hover state uses React `useState` + inline styles (not Tailwind group-hover)

### TaskForm (Modal)
- Fields: Title, Description, Priority (select), Due date, Status (edit only)
- **Selects:** `appearance: none` + wrapper div with absolutely-positioned SVG chevron
- Amber-accented modal with top border line

### TaskFilters
- Pill tabs with amber active gradient
- Sort by dropdown (same select pattern as TaskForm)

### TaskSearch
- Amber focus ring, search icon left, clear button right

### EmptyState
- Floating amber icon animation

### Modal / ConfirmDialog / Toast
- Dark backgrounds with amber border accents

---

## 5. Authentication Flow

```
App loads
  │
  ├── token in localStorage?
  │       ├── YES → set AuthContext → render protected routes
  │       └── NO  → redirect to /login
  │
  ├── API returns 401?
  │       └── axios interceptor → clear token → redirect to /login
  │
  └── Logout clicked → clear token + user → navigate to /login
```

---

## 6. React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 7. Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| Mobile (`< 1024px`) | Single-column, form fills full width, left branding panel hidden |
| Desktop (`>= 1024px`) | Split 50/50 layout on auth pages, centered dashboard |
