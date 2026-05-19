# Study Tracker

A student-facing study-time tracking and productivity dashboard. Log study
sessions, browse notes by subject and date range, set per-subject goals, and
view today/week totals plus a chart of time-per-subject on the dashboard.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Prisma** ORM over **SQLite**
- **NextAuth.js v5** (Auth.js) with credentials provider + bcrypt
- **Tailwind CSS v4**, hand-rolled lightweight UI primitives
- **Recharts** for dashboard visualisations
- **Zod** for shared request validation (frontend forms + API handlers)

## Architecture

```
src/app/(app)/*    frontend pages — fetch from /api/* only
src/app/(auth)/*   public auth pages
        ↓
src/app/api/*      thin HTTP route handlers (auth + Zod + delegate)
        ↓
src/server/        backend-only — Prisma access lives here
  ├── repositories/
  └── services/
        ↓
prisma/            schema + migrations + seed
```

- Pages never import Prisma or anything under `src/server/`.
- Shared DTO + Zod schemas live in `src/types/api.ts`.
- The frontend talks to the backend exclusively via `src/lib/api-client.ts`.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (defaults are fine for local dev)
cp .env.example .env

# 3. Create the SQLite database and seed 10 students
npm run db:migrate
npm run db:seed

# 4. Start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) — unauthenticated visits
redirect to the login page.

## Seed credentials

10 students are seeded with the same password. Pick any of them:

| Email                     | Password    |
| ------------------------- | ----------- |
| `student1@example.com`    | `password123` |
| `student2@example.com`    | `password123` |
| ...                       | ...           |
| `student10@example.com`   | `password123` |

Each student starts with an empty subject / session / goal list.

## Features

- **Login** – email + password (NextAuth credentials provider).
- **Log session** – `Sessions → New session`. Pick the date from a calendar,
  pick a subject from a dropdown (or click `+ New` to create one inline), enter
  minutes and optional notes.
- **Notes** – `Notes`. Filter by subject + date range to see every session's
  notes and a total.
- **Goals** – `Goals`. Set a weekly or monthly target-minutes per subject.
  Saving for the same subject + period updates the existing goal.
- **Dashboard** – `Dashboard`. Today and week totals, a bar chart of weekly
  minutes per subject, and goal-progress bars (current period actual vs target).

## API surface

All endpoints scoped to the signed-in student. Auth is enforced inside each
handler (the proxy redirect only protects page routes; API routes return JSON
401 when unauthenticated).

| Method | Path                       | Purpose                                       |
| ------ | -------------------------- | --------------------------------------------- |
| POST   | `/api/auth/[...nextauth]`  | NextAuth (sign-in / sign-out / session)       |
| GET    | `/api/subjects`            | List the student's subjects                   |
| POST   | `/api/subjects`            | Create or fetch existing subject by name      |
| GET    | `/api/sessions`            | `?subjectId=&from=YYYY-MM-DD&to=YYYY-MM-DD`   |
| POST   | `/api/sessions`            | Create a session                              |
| GET    | `/api/goals`               | List goals                                    |
| POST   | `/api/goals`               | Upsert a goal (subject + period unique)       |
| DELETE | `/api/goals/[id]`          | Delete a goal                                 |
| GET    | `/api/dashboard`           | Aggregated stats for the dashboard            |

## Scripts

| Command            | What it does                                          |
| ------------------ | ----------------------------------------------------- |
| `npm run dev`      | Next.js dev server with Turbopack                     |
| `npm run build`    | Production build (also type-checks the project)       |
| `npm run start`    | Run the production build                              |
| `npm run lint`     | ESLint                                                |
| `npm run db:migrate` | Create / apply Prisma migrations against `dev.db`   |
| `npm run db:seed`  | Re-run the seed script (idempotent — upserts students) |
| `npm run db:reset` | Drop + recreate the database, re-apply migrations + seed |

Inspect the database visually with `npx prisma studio`.

## Project layout

```
prisma/
  schema.prisma          # Student, Subject, StudySession, Goal
  seed.ts                # 10 fixed-credential students
src/
  proxy.ts               # Next 16 page-route auth redirect
  app/
    layout.tsx           # ToastProvider wrapper
    (auth)/login/        # public sign-in page
    (app)/               # auth-protected pages
      page.tsx           # dashboard
      sessions/new/
      notes/
      goals/
    api/                 # REST handlers (subjects, sessions, goals, dashboard)
  components/            # nav, forms, charts, ui primitives
  lib/                   # prisma, auth, api-client, date helpers, utils
  server/                # backend-only: repositories + services
  types/api.ts           # Zod schemas + DTOs shared by both layers
```
