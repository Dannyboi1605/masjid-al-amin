# ARCHITECTURE: Laman Web Masjid

Full reference. For the one-page version the agent reads on every task, see `ARCHITECTURE-ESSENTIALS.md`.
Scope and requirements live in `PRD.md`. Visual rules live in `DESIGN.md`.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), TypeScript `strict` | Use the version in `package.json`; check that version's docs before using caching or middleware APIs, because these have changed between majors |
| Styling | Tailwind CSS | Design tokens from `DESIGN.md` live in the Tailwind theme |
| Database + Auth + Storage | Supabase (Postgres, Auth, Storage) | Email/password only, public sign-up disabled |
| Supabase client | `@supabase/supabase-js` + `@supabase/ssr` | Cookie-based sessions for server components and actions |
| Validation | Zod | Every server action input and every external API response |
| Hosting | Vercel | Env vars set in the Vercel dashboard |
| Prayer data | JAKIM e-Solat API | Fetched server-side only, cached in Postgres |
| Package manager | pnpm | Agent may propose a change but must explain why |

Other libraries (forms, date handling, PWA tooling, icons) are the agent's choice per `AGENTS.md`, with a short justification.

---

## 2. Folder layout

```
src/
  app/
    (public)/
      page.tsx                  # landing
      pengumuman/page.tsx       # list
      pengumuman/[id]/page.tsx  # detail
      waktu-solat/page.tsx
      program/page.tsx
      carta-organisasi/page.tsx
      sumbangan/page.tsx
      layout.tsx                # public header + footer
    admin/
      log-masuk/page.tsx        # login (the only unprotected admin route)
      (protected)/
        layout.tsx              # session + role check, admin shell
        page.tsx                # dashboard home
        pengumuman/...          # list, new, [id]/edit
        program/...
        carta-organisasi/page.tsx # single image upload, replace, delete
        tetapan/page.tsx        # superadmin only
        pengguna/...            # superadmin only
        log-audit/page.tsx      # superadmin only (could-have)
    manifest.ts                 # PWA manifest
    layout.tsx                  # root: <html lang="ms">, fonts
  actions/                      # server actions, one file per domain
    announcements.ts
    events.ts
    org-chart.ts
    settings.ts
    users.ts
    auth.ts
  components/
    ui/                         # buttons, inputs, dialogs (generic)
    public/                     # MosqueHero, PrayerBand, AnnouncementList, EventList, QrCard
    admin/                      # tables, forms, shell
  lib/
    supabase/
      server.ts                 # server client (anon key + user cookies)
      browser.ts                # browser client (anon key)
      admin.ts                  # service-role client. SERVER ONLY, see section 5
    auth/
      roles.ts                  # requireUser(), requireRole()
    prayer/
      jakim.ts                  # fetch + Zod-parse + normalize
      cache.ts                  # Postgres cache read/write, staleness rules
      zones.ts                  # zone codes and names, grouped by state
      next-prayer.ts            # pure function: which prayer is next
    org-chart.ts                # org chart read + public URL
    time.ts                     # Asia/Kuala_Lumpur helpers
    audit.ts                    # writeAudit()
  types/
supabase/
  migrations/                   # SQL, numbered. The source of truth for the schema
  seed.sql                      # one site_settings row
public/
  icons/                        # PWA icons (192, 512, maskable)
.env.example
```

Route names are in Bahasa Melayu on purpose. Do not translate them.

---

## 3. Data model

All SQL lives in `supabase/migrations/`. Never change the schema from the Supabase dashboard without writing a migration.

```sql
create type public.app_role as enum ('admin', 'superadmin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 150),
  body text not null check (char_length(body) between 1 and 5000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 150),
  description text check (char_length(description) <= 5000),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

-- zero or one row; no row means no chart
create table public.org_chart (
  id boolean primary key default true check (id),
  image_path text not null,
  image_width int not null check (image_width between 1 and 20000),
  image_height int not null check (image_height between 1 and 20000),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- exactly one row
create table public.site_settings (
  id boolean primary key default true check (id),
  mosque_name text not null,
  address text,
  phone text,
  email text,
  prayer_zone text not null default 'SBH07',
  donation_qr_path text,          -- path inside the 'donation' storage bucket
  donation_note text,
  updated_at timestamptz not null default now()
);

-- one row per zone per year; data is the normalized array of days
create table public.prayer_times_cache (
  zone text not null,
  year int not null,
  data jsonb not null,
  fetched_at timestamptz not null default now(),
  primary key (zone, year)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,           -- e.g. 'qr.replace', 'user.create', 'settings.update'
  entity text not null,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);
```

Keep `updated_at` current with a trigger (`moddatetime` extension or a small function).

### Roles and RLS

Enable RLS on **every** table. Role helpers (note: `current_role` is a reserved word in Postgres, so use `auth_role`):

```sql
create function public.auth_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and is_active
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.auth_role() in ('admin', 'superadmin'), false)
$$;

create function public.is_superadmin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.auth_role() = 'superadmin', false)
$$;
```

| Table | Public (anon) | Admin | Superadmin |
|---|---|---|---|
| announcements | select | select, insert, update, delete | same |
| events | select | select, insert, update, delete | same |
| org_chart | select | select, insert, update, delete | same |
| site_settings | select | none (select only) | select, update |
| profiles | none | select own row | select all; writes via server actions |
| prayer_times_cache | none | none | none. Server reads/writes with the service-role client |
| audit_log | none | none | select. Inserts come from the server |

Storage bucket `donation`: public read; insert, update, and delete only where `public.is_superadmin()`.

Storage bucket `org-chart`: public read; insert, update, and delete where `public.is_admin()`.

Admins must not be able to change their own `role` or `is_active`. Profile writes are superadmin-only.

---

## 4. Auth and authorization

- Supabase Auth, email + password. **Disable public sign-up** in the Supabase dashboard. Accounts are created by a superadmin through the Users page (server action using the service-role client, which also inserts the `profiles` row).
- `requireUser()` and `requireRole('admin' | 'superadmin')` in `lib/auth/roles.ts`. Both read the session from cookies, load the `profiles` row, and check `is_active`. Use `getUser()` (verified), not an unverified session read, for authorization decisions.
- **Three layers, all required:**
  1. Request interception (middleware/proxy, depending on Next version) redirects unauthenticated visitors away from `/admin/(protected)`. This is a convenience, not security.
  2. Every server action and every admin page calls `requireRole(...)` first.
  3. RLS in Postgres is the final guard.
- Hiding a button in the UI is never access control.
- A deactivated user is rejected at layer 2 even if their session cookie is still valid.

---

## 5. Supabase keys and clients

| Key | Where | Client file |
|---|---|---|
| Anon/publishable key | Browser and server | `lib/supabase/browser.ts`, `server.ts` |
| Service-role/secret key | **Server only**, never `NEXT_PUBLIC_*` | `lib/supabase/admin.ts` |

Rules:
- `lib/supabase/admin.ts` starts with `import 'server-only'`.
- Only use the service-role client for: creating or deleting users, reading/writing `prayer_times_cache`, writing `audit_log`. Anything else goes through the user's own client so RLS applies.
- `.env.example` lists names only, never values.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

---

## 6. Prayer times (JAKIM e-Solat)

### Source
- Endpoint: `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=<PERIOD>&zone=<ZONE>`
- Periods seen in community docs: `today`, `week`, `month`, `year`, and `duration` (POST with start and end dates). **Verify against the live API during M3**, because there is no official stable contract and behavior can change.
- Zones are codes like `SBH07`. `lib/prayer/zones.ts` holds the full list.
- Expected fields per day (verify on first call): date, day, hijri, imsak, fajr, syuruk, dhuhr, asr, maghrib, isha. Dates and times may arrive as `19-Aug-2025` and `HH:mm:ss`. Do not trust that shape: parse with Zod and fail loudly.

### Normalized shape (what the rest of the app sees)

```ts
type PrayerDay = {
  date: string;     // 'YYYY-MM-DD'
  hijri?: string;
  subuh: string;    // 'HH:mm'
  syuruk: string;
  zohor: string;
  asar: string;
  maghrib: string;
  isyak: string;
};
```

### Flow: `getPrayerDay(zone, date)`
1. Read `prayer_times_cache` for `(zone, year)`.
2. If the row exists and `fetched_at` is under 24 hours old, use it.
3. Otherwise fetch `period=year` from JAKIM, parse, normalize, upsert the row, and use it.
4. If the fetch fails and an older row exists, use the old row and return `{ stale: true, fetchedAt }` so the UI shows the notice (PRD P7).
5. If the fetch fails and there is no row, or the date is not in the data, return `{ unavailable: true }` (PRD P8).

Why Postgres and not only the framework cache: the framework cache can be cleared on deploys, and we need a durable last-good copy for the stale fallback.

Fall-back plan: if `period=year` is unreliable, use `month` or `duration` per month, but keep the same cache semantics (an array of normalized days per key).

### Next prayer and countdown
- `lib/prayer/next-prayer.ts` is a **pure function**: given today's and tomorrow's `PrayerDay` and the current time in `Asia/Kuala_Lumpur`, return `{ name, at }`. After Isyak it returns tomorrow's Subuh, so the page loads both days.
- The countdown ticks in a small client component. The server renders the initial state to avoid a flash.
- All date math uses the `Asia/Kuala_Lumpur` zone explicitly. Never use the server's or the browser's local zone implicitly.

### Zone selection (PRD P4 to P6)
- Default: `site_settings.prayer_zone`.
- Visitor override via `?zon=SBH07` in the URL (shareable, no cookies needed).
- Manual dropdown from `zones.ts`.

---

## 7. "Use my location" (risk: needs verification)

JAKIM's API takes a **zone code, not coordinates**. Options, in order of preference:

1. **Nearest-zone lookup.** Browser gets coordinates, sends them to a server action, which returns a zone code. The community-run Waktu Solat API (`api.waktusolat.app`) offers a GPS-to-zone lookup, based on its published client library. This adds a third-party dependency, so verify the endpoint and its terms before relying on it, and wrap it in a timeout plus a Zod parse.
2. **Own lookup table.** Ship a static list of zone centre coordinates and pick the nearest by distance. Needs accurate data; do not invent coordinates.
3. **Dropdown only.** Drop the geolocation button and keep P6. This is the safe fallback and the app must work fully with it.

Rules: coordinates are used once to resolve a zone and are never stored or logged. If the lookup fails, show the dropdown.

---

## 8. Caching and rendering

| Page | Strategy |
|---|---|
| `/`, `/pengumuman`, `/program`, `/carta-organisasi`, `/sumbangan` | Static or cached; revalidated by tag when an admin saves a change |
| `/pengumuman/[id]` | Cached per id; revalidated on edit/delete |
| `/waktu-solat` | Dynamic (reads `date` and `zon` from the URL); data comes from the Postgres cache |
| `/admin/**` | Dynamic, never cached, `noindex` |

Server actions call revalidation for exactly the affected paths or tags after a successful write. Use the caching API that matches the installed Next version.

---

## 9. Server actions

Pattern for every mutation:

```ts
'use server'
export async function createAnnouncement(input: unknown) {
  const user = await requireRole('admin');          // 1. authorize
  const data = announcementSchema.parse(input);      // 2. validate (Zod)
  const supabase = await createServerClient();       // 3. user client, so RLS applies
  const { error } = await supabase.from('announcements').insert({ ...data, created_by: user.id });
  if (error) return { ok: false, message: 'Gagal menyimpan pengumuman.' };
  revalidate(...);                                   // 4. refresh caches
  return { ok: true };
}
```

- Return `{ ok: true } | { ok: false, message }`. Messages are in Bahasa Melayu and never leak internal errors.
- Superadmin actions use `requireRole('superadmin')`.
- Write to `audit_log` for: QR replace, settings change, user create/disable/delete, password reset.

---

## 10. Donation QR upload

1. Superadmin selects a file. The client checks type (PNG/JPG/WebP) and size (2 MB) for fast feedback.
2. The server action **re-validates** type and size, because client checks can be bypassed.
3. Upload to bucket `donation` under a new unique path (for example `qr/<timestamp>.<ext>`), update `site_settings.donation_qr_path`, delete the previous object, write an audit row.
4. The public page reads the path and renders the image with `next/image`. A download button links to the same file.

Uploading under a new path avoids stale CDN caching of the old QR.

### Org chart image

The org chart follows the same upload pattern, with bucket `org-chart`, a 4 MB limit, and admins allowed to upload, replace, and delete. The server stores the image width and height so the public page can reserve the correct space. `next.config.ts` raises the server action body limit to 5 MB (Next's default is 1 MB); 4 MB stays under Vercel's request body limit. The public page shows a full-width image and an in-app fullscreen zoom viewer (pinch, double tap, and buttons).

---

## 11. Content rendering and security

- Announcement and event text is **plain text**. Render it as text with `white-space: pre-line`. Never use `dangerouslySetInnerHTML` for user-entered content.
- Security headers via Next config: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` (or CSP `frame-ancestors`), and a sensible CSP once the font and Supabase hosts are known.
- Login throttling relies on Supabase Auth's built-in limits; do not build your own.
- Strong password minimum enforced in Supabase Auth settings.
- Dependencies are kept updated; run `pnpm audit` before launch.

---

## 12. PWA

- `app/manifest.ts`: name, short name, `lang: 'ms'`, `display: 'standalone'`, `theme_color` = `--hijau-malam`, icons 192 and 512 plus a maskable icon.
- Service worker: pre-cache the app shell and static assets; network-first for HTML; **never cache `/admin`** or any authenticated response. Version the cache so deploys invalidate it.
- No offline prayer times in v1. If offline, show a simple "Tiada sambungan internet" page.
- The agent may choose a PWA library (for example Serwist) or a small hand-written service worker, and must explain the choice.

---

## 13. Environments and deployment

- Two Supabase projects: `masjid-dev` and `masjid-prod`. Local `.env.local` points at dev. Vercel Production points at prod. Vercel Preview points at dev.
- Migrations are applied with the Supabase CLI (`supabase db push`) from the repo, never by hand-editing production.
- First superadmin: create the user in the Supabase dashboard, then insert a `profiles` row with `role = 'superadmin'`. Document the exact SQL in the README once it is done.
- Backups: the schema is in git. Export prayer cache is not needed (re-fetchable). Back up the QR image and settings by keeping a copy of the original QR file outside the system. Check the Supabase plan for automatic backups.

---

## 14. Error handling and observability

- Public pages never show raw errors. Use `error.tsx` and `not-found.tsx` in Bahasa Melayu.
- Log server errors with `console.error` (visible in Vercel logs). No third-party tracking in v1.
- JAKIM failures are logged once per fetch attempt, not once per visitor.

---

## 15. Decisions log

| Decision | Reason |
|---|---|
| Next.js + Supabase | Owner's choice; hosted auth and DB keep the project small |
| Postgres cache for prayer times | Durable stale fallback; one JAKIM request per zone per day |
| Roles in `profiles`, enforced by RLS | Single source of truth that survives UI bugs |
| QR upload is superadmin-only | It is the only asset tied to money; swapping it would redirect donations |
| Plain-text content | Removes the XSS surface and keeps the editor simple |
| BM-only routes and copy | Audience; no i18n layer to maintain |