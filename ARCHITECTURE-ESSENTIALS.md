# ARCHITECTURE-ESSENTIALS

One page. Read this before every task. Full detail is in `ARCHITECTURE.md`.

## What this is
Website for one mosque. Public pages (BM only): `/`, `/pengumuman`, `/waktu-solat`, `/program`, `/carta-organisasi`, `/sumbangan`. Admin at `/admin` with two roles: `admin` and `superadmin`.

## Stack
Next.js (App Router) + TypeScript strict, Tailwind, Supabase (Postgres, Auth, Storage), Zod, Vercel, pnpm. Prayer times from the JAKIM e-Solat API, cached in Postgres.

## Layout
```
src/app/(public)/...        public pages
src/app/admin/...           admin; only log-masuk is unprotected
src/actions/                server actions (all writes go through here)
src/lib/supabase/           server.ts, browser.ts, admin.ts (service role, server-only)
src/lib/auth/roles.ts       requireUser(), requireRole()
src/lib/prayer/             jakim.ts, cache.ts, zones.ts, next-prayer.ts
supabase/migrations/        schema source of truth
```

## Data flow
- **Reads (public):** server component → Supabase with anon key → RLS allows public select on announcements, events, org_chart, site_settings.
- **Writes (admin):** form → server action → `requireRole()` → Zod validate → Supabase with the user's own client (RLS applies) → revalidate cache → audit log if sensitive.
- **Prayer times:** page → `getPrayerDay(zone, date)` → Postgres cache (24h) → JAKIM on miss → last saved copy if JAKIM fails (show stale notice).

## Roles
- `admin`: announcements, events, and the org chart (create, edit, delete).
- `superadmin`: everything, plus donation QR, prayer zone, site settings, user management, audit log.

## Hard rules
1. Authorize in three layers: request interception, `requireRole()` in every action/page, and RLS. The UI is never access control.
2. Validate every input and every external response with Zod.
3. Service-role key lives only in `lib/supabase/admin.ts` (`server-only`). Never `NEXT_PUBLIC_`.
4. Schema changes are migrations in `supabase/migrations/`, never dashboard edits.
5. All time logic uses `Asia/Kuala_Lumpur` explicitly. Store `timestamptz`.
6. All user-facing text is Bahasa Melayu, sentence case.
7. Content is plain text. Render as text.
8. Follow `DESIGN.md` tokens; no ad-hoc colors or fonts.

## Never do this
- Never check a role only in the browser or only by hiding a button.
- Never use `dangerouslySetInnerHTML` with admin- or visitor-supplied text.
- Never put secrets in client code, logs, commits, or `.env.example`.
- Never call JAKIM from the browser or on every page view.
- Never cache or pre-cache anything under `/admin`.
- Never let an admin change roles, the QR, the prayer zone, or site settings.
- Never store or log visitor coordinates.
- Never add features outside `PRD.md` without asking first.
- Never enable public sign-up.