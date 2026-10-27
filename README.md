# Masjid Al-Amin

Website for one mosque. Public pages are in Bahasa Melayu. Staff manage announcements, events, the org chart, settings, the donation QR, and users through a protected admin area.

Stack: Next.js 16 App Router, TypeScript strict, Tailwind CSS 4, Supabase (Postgres, Auth, Storage), Zod, Vercel, pnpm.

## Requirements

- Node.js 20.9 or newer
- pnpm 10 or newer (`corepack enable pnpm`)
- A Supabase project
- The Supabase CLI for migrations (`npx supabase`)

## Setup

1. Install dependencies.

   ```bash
   pnpm install
   ```

2. Create `.env.local` from `.env.example`.

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   Use the project URL, the anon or publishable key, and the service role key from Supabase. The service role key is server-only. Never commit it or expose it with a `NEXT_PUBLIC_` prefix.

3. Link the dev project and apply migrations.

   ```bash
   npx supabase login
   npx supabase link --project-ref <dev-project-ref>
   npx supabase db push
   ```

   The migrations create the tables, role helpers, RLS policies, the `donation` and `org-chart` storage buckets, and the default site settings row.

4. Optional: add the development sample content. This is not applied to production.

   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/seed.dev.sql
   ```

   You can also paste the file into the Supabase SQL editor. It creates three announcements, three upcoming events, and one past event. Replace them with real content before launch.

5. Run the dev server.

   ```bash
   pnpm dev
   ```

## First superadmin

Supabase Auth is the source of truth for accounts. Create the first user in the Supabase dashboard:

1. Authentication, Users, Add user.
2. Use a real email address and a strong password.
3. Copy the new user's UUID.
4. Run this in the SQL editor:

   ```sql
   insert into public.profiles (id, full_name, role)
   values ('<user-uuid>', '<full name>', 'superadmin');
   ```

5. Sign in at `/admin/log-masuk`.

Every later admin account can be created from `/admin/pengguna` by a superadmin.

## Auth settings

In the Supabase dashboard:

- Authentication, Providers, Email: disable public sign-up.
- Authentication, Settings: set a minimum password length of at least 8.
- Authentication, URL Configuration: set the site URL and add `http://localhost:3000` and the production URL to the redirect allow list.

Authorization is enforced in three places: the proxy redirect, `requireRole()` in every admin page and server action, and RLS in Postgres. Hiding a link in the UI is never the only check.

## Routes

Public:

- `/` landing page
- `/pengumuman` announcements
- `/pengumuman/[id]` announcement detail
- `/waktu-solat` prayer times
- `/program` events
- `/carta-organisasi` org chart
- `/sumbangan` donation QR

Admin:

- `/admin/log-masuk` login, the only unprotected admin route
- `/admin` dashboard
- `/admin/pengumuman` announcements CRUD
- `/admin/program` events CRUD
- `/admin/carta-organisasi` org chart upload, replace, and delete
- `/admin/tetapan` settings and QR, superadmin only
- `/admin/pengguna` users, superadmin only
- `/admin/log-audit` audit log, superadmin only

## Commands

```bash
pnpm dev          # local dev server
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
npx supabase db push
```

## Prayer times

- Source: JAKIM e-Solat, `period=year`, fetched on the server only.
- Cache: `prayer_times_cache`, one row per zone per year, 24 hour freshness.
- If JAKIM fails, the last saved copy is shown with a notice. If there is no saved copy, the page shows an unavailable message.
- The zone defaults to `site_settings.prayer_zone`.
- "Guna lokasi saya" uses `api.waktusolat.app` to resolve a zone once. Coordinates are not stored or logged. If the lookup fails, the manual zone dropdown still works.
- The date picker is limited to the current year because the JAKIM yearly endpoint returns the current year.

## Donation QR

- Stored in the public `donation` bucket. The bucket accepts PNG, JPG, and WebP up to 2 MB.
- Each replacement uploads a new path and deletes the old object.
- Only a superadmin can upload or replace it.
- The download button fetches the image and saves it, because a phone cannot scan its own screen.

## Org chart

- Stored in the public `org-chart` bucket. The bucket accepts PNG, JPG, and WebP up to 4 MB.
- Admins can upload, replace, and delete a single image.
- The public page shows the chart full width and opens an in-app fullscreen viewer with pinch, double tap, and zoom buttons.
- The server stores the image dimensions so the page reserves the right space.

## PWA

- Manifest: `src/app/manifest.ts`.
- Icons: `public/icons/`, generated from the star mark. Regenerate with `node scripts/generate-icons.mjs`.
- Service worker: `public/sw.js`. It caches public pages and static assets, uses network-first for HTML, and never caches `/admin` or authenticated requests.
- The service worker is registered only in production.
- Offline fallback: `/offline`.
- Bump `CACHE_NAME` in `public/sw.js` when the offline page, icons, or shell assets change.

## Deployment

1. Create a production Supabase project.
2. Apply migrations to it with `npx supabase db push` after linking the production project.
3. Set the four environment variables in Vercel for Production. Point Preview at the dev project if you use previews.
4. Deploy the repository.
5. Create the first production superadmin using the SQL above.
6. Add the production URL to the Supabase redirect allow list.
7. Connect the domain.
8. Upload the real donation QR and enter the real mosque details in `/admin/tetapan`.
9. Add at least three announcements and three events before launch.

## Security notes

- The service role key is imported only in `src/lib/supabase/admin.ts`, which starts with `import "server-only"`.
- RLS is enabled on every table. The prayer cache and audit inserts are service-role only.
- Admin and superadmin cannot change their own role or active status through the database trigger.
- Content is rendered as plain text. There is no `dangerouslySetInnerHTML`.
- Security headers are set in `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- There is no analytics or visitor tracking.
- A strict CSP is not enabled yet. Next.js inline scripts need a nonce setup before a useful CSP can be added.

## Manual checks before launch

- Sign in as superadmin and create an admin account. Confirm the admin cannot open `/admin/tetapan`, `/admin/pengguna`, or `/admin/log-audit`, and cannot upload a QR by calling the action directly.
- Confirm a deactivated account cannot use an existing session.
- Compare prayer times with the official JAKIM site for three dates.
- Block the JAKIM request and confirm the stale notice appears.
- Upload and replace the QR, then download it on a phone.
- Install the PWA on one Android phone and one iPhone.
- Check all public pages at 360 px and at desktop width.
- Run a mobile Lighthouse check for performance and accessibility.
