# Claude Code Instructions — FlowList

This file is read automatically by Claude Code at the start of every session.
These are standing instructions that apply to all work on this project.

---

## Mandatory: Keep PROJECT.md in Sync

`PROJECT.md` is the single source of truth for this project's documentation.
**After every session where you make meaningful changes, you must update PROJECT.md.**

### What triggers an update

| Change made | Sections to update |
|---|---|
| New component or hook added | §3.2 Directory Structure, §3.6/3.7 as applicable |
| Component or hook removed/renamed | §3.2 Directory Structure |
| New API endpoint added | §3.8 API Layer (frontend), §4.3 API Endpoints (backend) |
| DB schema changed | §4.4 Database Schema |
| New env variable added | §4.6 Configuration, §6.3 Env Vars Reference |
| New npm or Gradle dependency | §3.1 or §4.1 Tech Stack |
| Auth / security logic changed | §3.4 Auth Flow, §4.5 Auth & Security |
| Deployment steps changed | §6 Deployment |
| New bug fixed / lesson learned | §7 Learnings & Gotchas |
| New known issue identified | §8 Known Issues & Future Work |
| Production URLs changed | §1 Project Overview, §6 Deployment |

### How to update

1. Read the relevant section(s) of `PROJECT.md`
2. Edit only the sections that reflect what changed — do not rewrite unrelated sections
3. Update the "Last updated" date at the top of `PROJECT.md`
4. Keep the existing structure and heading numbers — do not restructure

### What does NOT need an update

- Minor bug fixes with no API or architecture change
- Style-only CSS changes
- Refactors that don't change exported interfaces or file structure
- Dependency version bumps (unless they change behavior or caused issues)

---

## Project Context

- **Frontend:** React 19 + Vite 8 + TanStack Query v5. No router — view switching via local state.
- **Backend:** Spring Boot 3.4 + Java 21 + Gradle 8.12. No Lombok (incompatible with Java 21).
- **Auth:** JWT (jjwt 0.12.6, HS256). Token stored in `localStorage["fl_token"]`.
- **Database:** MySQL. Hibernate `ddl-auto=update` — schema auto-managed.
- **Frontend deployed:** Netlify → https://flowlist-app.netlify.app
- **Backend deployed:** Railway → https://flowlist-api-production.up.railway.app
- **VITE_API_URL** on Netlify must point to the Railway backend. After changing the backend URL, run `netlify env:set VITE_API_URL <new-url>` and redeploy.

## Design Rules

- All colors via CSS custom properties (`var(--token)`) — never raw hex in JSX except for white (`#fff`) on accent backgrounds.
- System font stack only — no web fonts.
- Both light and dark theme must be updated together in `index.css`.
- New categories must get entries in `CATEGORY_PALETTES` (`parseInput.js`) AND matching CSS tokens in `index.css`.

## Code Conventions

- **Frontend:** No new state libraries. Use TanStack Query for server state, `useState` for UI state.
- **Backend:** No Lombok. Write explicit getters/setters/builders.
- **Backend:** All task mutations must call `ownerTask()` for ownership verification before any DB write.
- **Backend:** New endpoints must be added to `SecurityConfig` if they should be public, otherwise they are auth-gated by default.
- **Env vars:** Never hardcode secrets. Add new vars to `.env.example` and `application.properties` with `${VAR:default}` syntax.

## Deployment Reminders

- Frontend changes → `netlify deploy --build --prod` from `flowlist/`
- Backend changes → `railway up --service flowlist-api --detach` from `flowlist-backend/`
- After adding new backend env vars → set them in Railway dashboard or via `railway variables set`
- After changing `VITE_API_URL` → must redeploy frontend for it to take effect
