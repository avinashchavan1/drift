# FlowList — Project Documentation

> **Living document.** Updated automatically by Claude Code whenever the codebase changes.
> Last updated: 2026-03-31

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Frontend](#3-frontend)
   - [Tech Stack](#31-tech-stack)
   - [Directory Structure](#32-directory-structure)
   - [Design System](#33-design-system)
   - [Auth Flow](#34-auth-flow)
   - [State & Data Management](#35-state--data-management)
   - [Key Components](#36-key-components)
   - [Views](#37-views)
   - [API Layer](#38-api-layer)
4. [Backend](#4-backend)
   - [Tech Stack](#41-tech-stack)
   - [Directory Structure](#42-directory-structure)
   - [API Endpoints](#43-api-endpoints)
   - [Database Schema](#44-database-schema)
   - [Auth & Security](#45-auth--security)
   - [Configuration](#46-configuration)
5. [Development Setup](#5-development-setup)
6. [Deployment](#6-deployment)
   - [Frontend → Netlify](#61-frontend--netlify)
   - [Backend → Railway](#62-backend--railway)
   - [Environment Variables Reference](#63-environment-variables-reference)
   - [Redeployment Cheatsheet](#64-redeployment-cheatsheet)
7. [Learnings & Gotchas](#7-learnings--gotchas)
8. [Known Issues & Future Work](#8-known-issues--future-work)

---

## 1. Project Overview

FlowList is a personal task manager with a clean Instagram-inspired UI. Users register, log in, and manage tasks across three views — **Today**, **Upcoming**, and **Focus**. Tasks support natural-language input (`Buy milk tomorrow #personal 5pm`), due dates, categories, and completion tracking.

| Property | Value |
|---|---|
| Frontend URL | https://flowlist-app.netlify.app |
| Backend URL | https://flowlist-api-production.up.railway.app |
| Backend health | https://flowlist-api-production.up.railway.app/api/health |
| Frontend repo | `flowlist/` (this repo) |
| Backend repo | `flowlist-backend/` · https://github.com/avinashchavan1/flowlist-backend |

---

## 2. Architecture

```
Browser
│
├─ React 19 + Vite 8  (Netlify)
│   ├─ ThemeProvider    ── CSS var dark/light, persisted to localStorage
│   ├─ AuthProvider     ── JWT stored in localStorage as "fl_token"
│   ├─ QueryClientProvider (TanStack Query v5)
│   │    └─ useTasks, useAddTask, useCompleteTask … (optimistic mutations)
│   ├─ Views: TodayView │ UpcomingView │ FocusView
│   ├─ Components: TaskItem, TaskGroup, TaskFormSheet, Sidebar, MobileNav …
│   └─ api/client.js   ── fetch wrapper; injects Bearer token on every call
│         ├─ api/auth.js  →  POST /register, POST /login, GET /me
│         └─ api/tasks.js →  GET/POST/PUT/PATCH/DELETE /tasks
│
│   VITE_API_URL ─────────────────────────────────────────────────────────┐
│                                                                          │
├─ Spring Boot 3.4 / Java 21  (Railway — Docker)                          │
│   ├─ JwtAuthFilter       ── Bearer token → SecurityContext on every req  │
│   ├─ SecurityConfig      ── stateless, CORS, public routes               │
│   ├─ AuthController      ── /api/auth/*                                  │
│   ├─ TaskController      ── /api/tasks/*  (all routes auth-gated)        │
│   ├─ AuthService / TaskService / JwtService                              │
│   └─ Spring Data JPA  ────────────────────────────────────────────────┐ │
│                                                                        │ │
└─ MySQL 9.4  (Railway managed)  ◄──────────────────────────────────────┘ │
    ├─ users  (id, email, password, name, created_at)                      │
    └─ tasks  (id, user_id, title, due_date, category,                     │
               completed, completed_at, created_at, updated_at)            │
                                                                           │
Netlify env: VITE_API_URL=https://flowlist-api-production.up.railway.app/api
```

---

## 3. Frontend

### 3.1 Tech Stack

| Library | Version | Role |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool + dev server |
| TanStack Query | v5 | Server state, caching, optimistic updates |
| date-fns | v4 | Date arithmetic and formatting |
| lucide-react | latest | Icon set |
| Tailwind CSS | v4 | Utility classes (minimal use — most styling is inline with CSS vars) |

> **No router library.** Navigation is state-based: `view` state in `App.jsx` switches between `'today' | 'upcoming' | 'focus'`.

### 3.2 Directory Structure

```
src/
├─ main.jsx                   # React DOM entry point
├─ App.jsx                    # Root shell — providers, view switcher, layout
├─ index.css                  # All CSS custom properties (design tokens) + Tailwind
│
├─ api/
│   ├─ client.js              # fetch wrapper; reads VITE_API_URL; attaches Bearer token
│   ├─ auth.js                # register / login / me calls
│   └─ tasks.js               # CRUD calls + toPayload() date serialiser
│
├─ hooks/
│   ├─ useAuth.jsx            # AuthContext — JWT lifecycle, login/register/logout
│   ├─ useTheme.jsx           # ThemeContext — dark/light toggle, localStorage + data-theme
│   ├─ useIsMobile.js         # matchMedia hook — returns true if viewport < 768px
│   └─ useTasks.js            # TanStack Query hooks for all task operations
│
├─ views/
│   ├─ TodayView.jsx          # Overdue / Today / No-deadline task groups + completed section
│   ├─ UpcomingView.jsx       # Tasks after today, grouped by calendar date
│   ├─ FocusView.jsx          # Top-3 priority tasks, session affordance
│   └─ AuthView.jsx           # Login / Register form
│
├─ components/
│   ├─ Sidebar.jsx            # Desktop left nav — routes, tags, user footer, logout
│   ├─ MobileNav.jsx          # Fixed bottom tab bar for mobile
│   ├─ TaskItem.jsx           # Task row — checkbox, inline edit, swipe, delete
│   ├─ TaskGroup.jsx          # Labeled section wrapper (red/orange/gray/blue dot)
│   ├─ TaskFormSheet.jsx      # Bottom sheet — title input, date, category picker
│   ├─ QuickAddInput.jsx      # Fake input that opens TaskFormSheet; registers "/" hotkey
│   ├─ CategoryChip.jsx       # Colored #category pill badge
│   └─ DateBadge.jsx          # Color-coded due-date pill (overdue/today/tomorrow/future)
│
├─ store/
│   └─ taskStore.js           # Legacy localStorage task store (seed data for dev only)
│
├─ utils/
│   └─ parseInput.js          # NLP parser for quick-add; CATEGORY_PALETTES registry
│
└─ assets/
    ├─ hero.png
    ├─ react.svg
    └─ vite.svg
```

### 3.3 Design System

The entire visual language lives in **CSS custom properties** defined in `src/index.css`. Switching themes is a single attribute toggle (`data-theme="dark"` on `<html>`) — no React re-render required.

**Token categories:**

| Category | Tokens |
|---|---|
| Backgrounds | `--bg`, `--surface`, `--surface-hover`, `--surface-input` |
| Borders | `--border`, `--border-subtle`, `--border-strong` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-faint` |
| Accent | `--accent` (`#0095F6`), `--accent-bg`, `--accent-text` |
| Danger | `--danger` (`#FF3040`), `--danger-bg` |
| Categories | `--cat-{name}-bg/text/dot` for work/personal/social/health/finance/learning |
| Date badges | `--badge-{overdue/today/tomorrow/future}-bg/text/border` |
| Group labels | `--group-{red/orange/gray/blue}-dot/text` |

**FOUC prevention:** `index.html` contains an inline `<script>` that reads `localStorage.theme` and sets `data-theme` on `<html>` before the first paint.

**Typography:** System font stack only — `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. No web fonts loaded. Weights used: 400 (body) and 600 (labels/headings).

### 3.4 Auth Flow

```
App mounts
  └─ AuthProvider.useEffect
       ├─ reads localStorage["fl_token"]
       ├─ if missing → setLoading(false), user=null → renders <AuthView>
       └─ if present → GET /api/auth/me
             ├─ success → setUser(data) → renders main app
             └─ fail (expired/invalid) → removes token → renders <AuthView>

Login / Register
  └─ AuthView calls useAuth.login() or .register()
       └─ API returns { token, user }
            └─ stored in localStorage["fl_token"]
            └─ setUser(user) → AuthProvider re-renders → main app shown

Logout
  └─ removes localStorage["fl_token"]
  └─ setUser(null) → <AuthView> shown
  └─ queryClient.clear() → cached task data wiped
```

Every API call in `api/client.js` reads `fl_token` from `localStorage` and attaches it as `Authorization: Bearer <token>`. If the token is absent, the header is omitted (the backend returns 403).

### 3.5 State & Data Management

**Server state** is owned by TanStack Query. The `['tasks']` query key is the single source of truth.

All five mutations follow the same **optimistic update pattern**:

```
onMutate  → cancel in-flight queries, snapshot prev, apply local update
onError   → roll back to snapshot
onSettled → invalidate ['tasks'] to sync with server
```

This means the UI responds instantly to user actions while the network request happens in the background. If the request fails, the UI reverts silently.

**UI state** lives in `App.jsx`:
- `view` — `'today' | 'upcoming' | 'focus'`
- `categoryFilter` — `string | null` — active tag filter; cleared on view change

**Theme & Auth state** live in their respective React Contexts.

### 3.6 Key Components

**`TaskItem`** — The most complex component. Handles:
- Optimistic checkbox toggle (complete ↔ uncomplete)
- Inline title editing (click-to-edit, Enter/Escape/blur)
- Touch swipe-right gesture (48px threshold → complete)
- Hover-revealed delete button
- Completed state (strikethrough, muted, filled checkbox)

**`TaskFormSheet`** — Rendered via `createPortal(…, document.body)` so it always sits above the fixed bottom nav (`z-index: 70 > nav z-index: 50`). Supports:
- Natural language quick-add via `parseInput.js`
- Explicit date + time pickers
- Category grid picker
- `/` or `Cmd+K` global keyboard shortcut (registered in `QuickAddInput`)
- Locks body scroll while open

**`Sidebar`** — Computes `todayCount` (overdue + due today) and the category list (sorted by task count) from the live task cache — no extra API calls.

### 3.7 Views

| View | Shows | Groups tasks by |
|---|---|---|
| Today | Active tasks due today or earlier + no-deadline + completed section | Overdue (red) · Today (orange) · No deadline (gray) |
| Upcoming | Tasks due after today | Calendar date (Tomorrow / Mon / Next Wed / Apr 15) |
| Focus | Top-3 by soonest due date, then newest | Single ranked list — no groups |

All views support `categoryFilter` prop — filters to only tasks with that category tag.

### 3.8 API Layer

`api/client.js` is the single fetch wrapper. All API modules import from it.

```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
// Attaches: Authorization: Bearer <fl_token from localStorage>
// Handles: 204 → null, JSON parse, throws on non-ok with .status
```

**Auth endpoints (`api/auth.js`):**
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | `{name, email, password}` | `{token, tokenType, expiresInDays, user}` |
| POST | `/auth/login` | `{email, password}` | same |
| GET | `/auth/me` | — | `{id, name, email}` |

**Task endpoints (`api/tasks.js`):**
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/tasks` | — | `Task[]` |
| POST | `/tasks` | `{title, dueDate?, category?}` | `Task` (201) |
| PUT | `/tasks/:id` | `{title, dueDate?, category?}` | `Task` |
| PATCH | `/tasks/:id/complete` | — | `Task` |
| PATCH | `/tasks/:id/uncomplete` | — | `Task` |
| DELETE | `/tasks/:id` | — | (204) |

---

## 4. Backend

### 4.1 Tech Stack

| Library | Version | Role |
|---|---|---|
| Spring Boot | 3.4.4 | Framework |
| Java | 21 | Runtime |
| Gradle | 8.12 | Build tool |
| Spring Security | 6 (via Boot) | Auth filter chain |
| Spring Data JPA | 3.4 (via Boot) | ORM / repositories |
| Hibernate | 6.6 | JPA implementation |
| MySQL Connector/J | latest (via Boot BOM) | JDBC driver |
| jjwt | 0.12.6 | JWT generation & validation |
| BCrypt | (via Spring Security) | Password hashing |

> **No Lombok.** Removed due to a fatal incompatibility with Java 21 (`ExceptionInInitializerError: TypeTag::UNKNOWN`). All entities/DTOs/services use explicit getters, setters, and builders.

### 4.2 Directory Structure

```
src/main/java/com/flowlist/
├─ FlowlistApplication.java        # @SpringBootApplication entry point
│
├─ config/
│   ├─ SecurityConfig.java         # Filter chain, CORS, BCrypt, AuthManager
│   └─ GlobalExceptionHandler.java # @RestControllerAdvice → JSON error shapes
│
├─ controller/
│   ├─ AuthController.java         # /api/auth/register, /login, /me
│   ├─ TaskController.java         # /api/tasks  CRUD + complete/uncomplete
│   └─ HealthController.java       # /api/health  (no auth)
│
├─ dto/
│   ├─ RegisterRequest.java        # name, email, password  (validated)
│   ├─ LoginRequest.java           # email, password  (validated)
│   ├─ TaskRequest.java            # title, dueDate?, category?
│   ├─ AuthResponse.java           # token + nested UserDto
│   └─ TaskResponse.java           # full task shape + static from(Task) factory
│
├─ entity/
│   ├─ User.java                   # users table — id(BIGINT), email(UNIQUE), password, name
│   └─ Task.java                   # tasks table — id(UUID), user_id(FK), title, dates…
│
├─ repository/
│   ├─ UserRepository.java         # findByEmail, existsByEmail
│   └─ TaskRepository.java         # findByUserId…, findByIdAndUserId, deleteByIdAndUserId
│
├─ security/
│   ├─ JwtAuthFilter.java          # OncePerRequestFilter — Bearer → SecurityContext
│   └─ UserDetailsServiceImpl.java # email → Spring UserDetails (ROLE_USER)
│
└─ service/
    ├─ JwtService.java             # generateToken, extractEmail, isValid, getExpirationDays
    ├─ AuthService.java            # register, login, me → AuthResponse
    └─ TaskService.java            # getAll, create, update, complete, uncomplete, delete
```

### 4.3 API Endpoints

All `/api/tasks/**` routes require `Authorization: Bearer <token>`.

```
GET    /api/health                         → { status, service }          (public)

POST   /api/auth/register                  → AuthResponse                 (public)
POST   /api/auth/login                     → AuthResponse                 (public)
GET    /api/auth/me                        → UserDto                      (auth)

GET    /api/tasks                          → Task[]                       (auth)
POST   /api/tasks                          → Task  (201)                  (auth)
PUT    /api/tasks/{id}                     → Task                         (auth)
PATCH  /api/tasks/{id}/complete            → Task                         (auth)
PATCH  /api/tasks/{id}/uncomplete          → Task                         (auth)
DELETE /api/tasks/{id}                     →        (204)                 (auth)
```

**Error shape** (all errors):
```json
{ "status": 400, "error": "human-readable message" }
```

**Task shape:**
```json
{
  "id":          "uuid-string",
  "title":       "Buy groceries",
  "dueDate":     "2026-04-01T09:00:00Z",
  "category":    "personal",
  "completed":   false,
  "completedAt": null,
  "createdAt":   "2026-03-31T10:00:00Z",
  "updatedAt":   "2026-03-31T10:00:00Z"
}
```

### 4.4 Database Schema

Hibernate `ddl-auto=update` manages schema automatically.

```sql
CREATE TABLE users (
  id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,        -- BCrypt hash
  name       VARCHAR(255),
  created_at DATETIME(6)
);

CREATE TABLE tasks (
  id           VARCHAR(36)  PRIMARY KEY,   -- UUID generated in Java
  user_id      BIGINT       NOT NULL,
  title        VARCHAR(500) NOT NULL,
  due_date     DATETIME(6),
  category     VARCHAR(100),
  completed    BIT          NOT NULL DEFAULT 0,
  completed_at DATETIME(6),
  created_at   DATETIME(6),
  updated_at   DATETIME(6),
  INDEX idx_tasks_user_id (user_id),
  INDEX idx_tasks_due_date (due_date),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Ownership enforcement:** Every task mutation calls `findByIdAndUserId(taskId, userId)` — if the task doesn't belong to the requesting user, `AccessDeniedException` is thrown and the `GlobalExceptionHandler` maps it to a **404** (intentionally obscures whether the task exists).

### 4.5 Auth & Security

**JWT:** Signed with HS256 (`Keys.hmacShaKeyFor`). Token payload: `sub=email`, `iat`, `exp`. Expiry is configurable via `JWT_EXPIRATION_DAYS` (default 30 days).

**Filter chain:**
```
Request → JwtAuthFilter
  ├─ reads "Authorization: Bearer <token>"
  ├─ extractEmail → loadUserByUsername → isValid(token, userDetails)
  ├─ success → sets UsernamePasswordAuthenticationToken in SecurityContextHolder
  └─ failure (missing/invalid token) → passes through silently
       └─ SecurityFilterChain returns 403 for protected routes
```

**Password hashing:** BCrypt via `PasswordEncoder` bean in `SecurityConfig`. Passwords are never stored or returned in plain text.

**CORS:** Configured for all origins listed in `CORS_ALLOWED_ORIGINS` (comma-separated). Credentials are allowed. Applied to `/api/**`.

### 4.6 Configuration

All configuration is environment-variable driven. `application.properties` uses Spring's `${VAR:default}` syntax.

| Property | Env Var | Default |
|---|---|---|
| `server.port` | `PORT` then `SERVER_PORT` | `8080` |
| `spring.datasource.url` | `DB_HOST`, `DB_PORT`, `DB_NAME` | `localhost:3306/flowlist` |
| `spring.datasource.username` | `DB_USERNAME` | `flowlist_user` |
| `spring.datasource.password` | `DB_PASSWORD` | `flowlist_pass` |
| `app.jwt.secret` | `JWT_SECRET` | (weak dev default) |
| `app.jwt.expiration-days` | `JWT_EXPIRATION_DAYS` | `30` |
| `app.cors.allowed-origins` | `CORS_ALLOWED_ORIGINS` | localhost + netlify |

> **Note on Railway:** Railway injects `PORT` automatically. The `PORT > SERVER_PORT > 8080` chain ensures the app binds to Railway's assigned port without any extra configuration.

---

## 5. Development Setup

### Prerequisites

- Node.js 20+
- Java 21
- MySQL 8+ running locally
- Gradle (or use the `./gradlew` wrapper — no install needed)

### Frontend

```bash
cd flowlist
npm install
# .env.local already has VITE_API_URL=http://localhost:8080/api
npm run dev        # → http://localhost:5173
```

### Backend

```bash
cd flowlist-backend

# 1. Copy and fill in your local values
cp .env.example .env
# Edit .env: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD

# 2. Create DB + user in MySQL (first time only)
mysql -u root -e "
  CREATE DATABASE IF NOT EXISTS flowlist;
  CREATE USER IF NOT EXISTS 'flowlist_user'@'localhost' IDENTIFIED BY 'flowlist_pass';
  GRANT ALL PRIVILEGES ON flowlist.* TO 'flowlist_user'@'localhost';
  FLUSH PRIVILEGES;"

# 3. Build and run (start.sh sources .env automatically)
./start.sh
# OR for hot dev:
source .env && ./gradlew bootRun
```

Backend starts at http://localhost:8080. Hibernate auto-creates tables on first run.

---

## 6. Deployment

### 6.1 Frontend → Netlify

**Site:** https://flowlist-app.netlify.app

The frontend is deployed to Netlify. Build command: `npm run build`. Publish directory: `dist/`.

**How to redeploy after frontend changes:**
```bash
cd flowlist
netlify deploy --build --prod
```

**Netlify environment variables** (set via `netlify env:set` or the dashboard):
| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://flowlist-api-production.up.railway.app/api` |

### 6.2 Backend → Railway

**Project:** `attractive-encouragement` on Railway
**Services:** `flowlist-api` (Spring Boot) + `MySQL-m08S` (managed MySQL 9.4)

The backend is deployed as a Docker container built from `Dockerfile`. Railway pulls from the latest `railway up` upload.

**How it works:**
1. `railway up` uploads the source to Railway
2. Railway builds the Docker image (2-stage: JDK build → JRE runtime)
3. The container starts, Spring Boot connects to the Railway-internal MySQL using env vars
4. Railway generates a public HTTPS domain and proxies to the container's port

**How to redeploy after backend changes:**
```bash
cd flowlist-backend
export RAILWAY_API_TOKEN=<your-token>
railway up --service flowlist-api --detach
# Watch logs:
railway logs --service flowlist-api
```

**MySQL is internal only.** The MySQL service is on Railway's private network (`mysql-m08s.railway.internal`). It's not publicly accessible — only the `flowlist-api` service can reach it. A public proxy URL exists for admin tools but is not used in production.

### 6.3 Environment Variables Reference

**Railway (flowlist-api service):**
| Variable | Description |
|---|---|
| `DB_HOST` | `mysql-m08s.railway.internal` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `railway` |
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | (set by Railway MySQL plugin) |
| `JWT_SECRET` | Random 32+ char secret — change this! |
| `JWT_EXPIRATION_DAYS` | `30` |
| `CORS_ALLOWED_ORIGINS` | `https://flowlist-app.netlify.app,http://localhost:5173` |

> `PORT` is injected automatically by Railway — no need to set it.

**Netlify (flowlist-app site):**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL of the Railway backend API (no trailing slash) |

**Local dev (`flowlist-backend/.env`):**
See `.env.example` for all keys with descriptions.

### 6.4 Redeployment Cheatsheet

| What changed | Command |
|---|---|
| Frontend code | `cd flowlist && netlify deploy --build --prod` |
| Backend code | `cd flowlist-backend && railway up --service flowlist-api --detach` |
| Backend env vars | Update via Railway dashboard or `railway variables set KEY=VALUE` |
| Frontend env vars | `netlify env:set KEY value` then redeploy |
| Both | Run both commands above |

---

## 7. Learnings & Gotchas

### 7.1 Lombok is incompatible with Java 21

**Problem:** Adding `lombok` to the `build.gradle` caused a fatal `ExceptionInInitializerError: com.sun.tools.javac.code.TypeTag :: UNKNOWN` at compile time. Lombok's annotation processor relies on internal JDK compiler APIs that were locked down in Java 17+ and fully broken in Java 21.

**Fix:** Removed Lombok entirely. Rewrote all `@Data`, `@Builder`, `@RequiredArgsConstructor` usages by hand — explicit getters, setters, constructors, and static `Builder` inner classes. More verbose but fully compatible and debuggable.

**Lesson:** Never use Lombok with Java 17+. It's not worth the fragility. Use records for immutable DTOs, or just write the boilerplate.

### 7.2 Railway injects `PORT`, not `SERVER_PORT`

**Problem:** Spring Boot was not binding to Railway's assigned port. The service was deploying successfully but Railway's health check was timing out because the app was listening on 8080 while Railway expected a different port.

**Fix:** Updated `application.properties` to `server.port=${PORT:${SERVER_PORT:8080}}`. The nested Spring EL syntax checks `PORT` first (set by Railway), falls back to `SERVER_PORT` (our `.env` convention), then to the hardcoded `8080`.

**Lesson:** When deploying to any PaaS, always check how they inject the port. Railway uses `PORT`. Render uses `PORT`. Heroku uses `PORT`. Never hardcode `8080` in production.

### 7.3 `@CreationTimestamp` / `@UpdateTimestamp` return null after `save()`

**Problem:** After calling `repository.save(task)`, the returned entity had `null` for `createdAt` and `updatedAt`. This broke `TaskResponse.from(task)`.

**Root cause:** Hibernate's `@CreationTimestamp` populates the DB column at flush time, but the returned Java object is not refreshed from the DB after the insert. The in-memory entity still has `null`.

**Fix:** Replaced Hibernate annotations with JPA lifecycle callbacks:
```java
@PrePersist
void prePersist() { this.createdAt = Instant.now(); this.updatedAt = Instant.now(); }

@PreUpdate
void preUpdate() { this.updatedAt = Instant.now(); }
```
These run in-process before Hibernate issues the SQL, so the object already has the timestamps when `save()` returns.

### 7.4 `UserDetailsServiceImpl` class name conflict

**Problem:** `com.flowlist.entity.User` and `org.springframework.security.core.userdetails.User` both imported in the same file caused a compile error.

**Fix:** Used the fully-qualified name `org.springframework.security.core.userdetails.User` inline in the `loadUserByUsername` method, removing the import entirely. Simple and explicit.

### 7.5 `useIsMobile` instead of Tailwind `md:` breakpoints

**Problem:** Tailwind's responsive prefixes (`md:hidden`, `md:flex`) work at the CSS level, which means both desktop and mobile DOM nodes always exist — they're just hidden/shown with CSS. This caused the sidebar to always render on mobile (wasting resources) and created z-index conflicts with the fixed bottom nav.

**Fix:** Replaced all responsive CSS with a `useIsMobile()` hook that uses `window.matchMedia`. Components are conditionally rendered in JSX — the sidebar is never mounted on mobile, the bottom nav is never mounted on desktop. Clean, explicit, and performant.

### 7.6 TaskFormSheet z-index and `createPortal`

**Problem:** The task creation sheet was rendering inside the main content div. On mobile, the fixed bottom nav (`z-index: 50`) was layering over the sheet.

**Fix:** Used `ReactDOM.createPortal(content, document.body)` to render the sheet directly into `<body>`. Since it's appended to the DOM after the nav element, and its `z-index: 70` is higher than the nav's `z-index: 50`, it always renders on top. The scrim (backdrop) gets `z-index: 60`.

### 7.7 Maven vs Gradle

The project was initially set up with Maven. Switched to Gradle on user request. Key differences:
- Gradle uses `build/libs/` instead of `target/`
- The Spring Boot fat JAR excludes `*-plain.jar` — use `! -name "*plain*"` in scripts
- Gradle wrapper is generated with `gradle wrapper --gradle-version X.Y` — requires Gradle installed locally once (via `brew install gradle`), then the wrapper handles everything

### 7.8 JWT secret key size

**Problem:** jjwt 0.12.x requires the HMAC key to be at least 256 bits (32 bytes) for HS256. A secret shorter than 32 characters throws `WeakKeyException` at startup.

**Fix:** Ensure `JWT_SECRET` is always ≥ 32 characters. The dev default is intentionally long.

---

## 8. Known Issues & Future Work

| Area | Issue / Idea |
|---|---|
| Backend | `spring.jpa.open-in-view=true` warning — set to `false` in properties to prevent lazy-loading during view rendering |
| Backend | Spring Security logs a warning about `UserDetailsService` beans being ignored because a custom `AuthenticationProvider` is registered. Benign but noisy. |
| Backend | DDL `update` is fine for development but risky in production — consider Flyway or Liquibase for proper migrations |
| Frontend | `store/taskStore.js` (localStorage seed) is a legacy artifact — can be removed once the backend is the sole data source |
| Frontend | No offline support — all state is server-side; a failed network request shows nothing |
| Frontend | Focus view "Start Focus Session" button is a visual affordance only — no timer or actual session tracking |
| Auth | No "forgot password" flow |
| Auth | No token refresh — tokens expire after `JWT_EXPIRATION_DAYS` days and the user must log in again |
| Infra | Railway free credits are limited — monitor usage at railway.com dashboard |
