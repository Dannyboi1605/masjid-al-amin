# PRD: Laman Web Masjid

Status: draft v0.1, ready for build
Owner: Afiq
Language of the site: Bahasa Melayu only (docs are in English)

---

## 1. Overview

A small, fast website for one mosque. Jemaah open it mainly on their phones to check **waktu solat**, read **pengumuman**, see upcoming **program**, and find the **DuitNow QR** for donations. Mosque staff update content through a login-protected admin dashboard, with no code changes and no redeploys.

### Goals
1. Today's prayer times visible within one tap (ideally zero taps, on the landing page).
2. Staff can publish an announcement or event in under a minute from a phone.
3. Donation QR is always current and only a superadmin can change it.
4. Loads fast on mid-range phones over 4G.

### Non-goals (v1)
Online payments, RSVP or registration, user accounts for jemaah, multi-language, push notifications, newsletters, photo gallery, analytics, offline prayer times.

---

## 2. Users and roles

| Role | Login | Description |
|---|---|---|
| Jemaah (visitor) | No | Reads public pages only |
| Admin | Yes | Day-to-day content: announcements and events |
| Superadmin | Yes | Everything an admin can do, plus site settings, donation QR, prayer zone, and user management |

---

## 3. Public pages

Routes are in Bahasa Melayu. Priority: **M** = must, **S** = should, **C** = could.

### 3.1 Landing page `/`
| ID | Requirement | P |
|---|---|---|
| L1 | Hero welcomes visitors with the mosque name over a real photo of the mosque. Immediately below, the landing page shows today's six prayer times for the mosque's zone, highlights the next prayer, and shows a live countdown | M |
| L2 | Latest 3 announcements with a link to the full list | M |
| L3 | Next 3 upcoming events with a link to the full list | M |
| L4 | Donation call-to-action linking to `/sumbangan` | M |
| L5 | Header (nav) and footer with mosque name, address, phone, and email from site settings | M |

### 3.2 Prayer times `/waktu-solat`
| ID | Requirement | P |
|---|---|---|
| P1 | Show Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak for the selected date; default is today in `Asia/Kuala_Lumpur` | M |
| P2 | Highlight the next prayer and show a countdown when the date is today | M |
| P3 | Visitor can change the date (date picker plus previous/next day buttons) to see any available date | M |
| P4 | Zone defaults to the mosque's zone from site settings | M |
| P5 | Button "Guna lokasi saya" detects the visitor's zone from browser location, only after they tap it | S |
| P6 | Manual zone dropdown (grouped by state) as the fallback when location is denied or fails | S |
| P7 | If JAKIM is unreachable, show the last saved data with a notice stating when it was saved | M |
| P8 | If a requested date is not available yet, show a clear message, not an error | M |
| P9 | Monthly table view | C |
| P10 | Show Hijri date (JAKIM returns it) | C |

### 3.3 Announcements `/pengumuman`
| ID | Requirement | P |
|---|---|---|
| A1 | List newest first, 10 per page, showing title, date, and an excerpt | M |
| A2 | Detail page `/pengumuman/[id]` with title, date, and full body | S |
| A3 | Text only: title plus body, with line breaks preserved. No images, tags, pinning, or expiry in v1 | M |

### 3.4 Events `/program`
| ID | Requirement | P |
|---|---|---|
| E1 | Upcoming events first (soonest first); past events in a separate collapsed "Program lepas" list, newest first, limited to the last 20 | M |
| E2 | Each event shows title, date, time, location, and description | M |
| E3 | No RSVP, no calendar view | M |

### 3.5 Donation `/sumbangan`
| ID | Requirement | P |
|---|---|---|
| D1 | Show the DuitNow QR image large and centred, as uploaded by a superadmin | M |
| D2 | Short instruction text, editable by the superadmin in settings | M |
| D3 | "Muat turun kod QR" button, because on a phone people must save the image and import it into their banking app, since they can't scan their own screen | S |
| D4 | Friendly empty state if no QR has been uploaded yet | M |

### 3.6 Org chart `/carta-organisasi`
| ID | Requirement | P |
|---|---|---|
| O1 | Show the current org chart image at full content width | M |
| O2 | Visitor can open the image fullscreen and zoom in via pinch, double tap, or zoom buttons | M |
| O3 | Friendly empty state if no chart has been uploaded yet | M |

---

## 4. Admin dashboard `/admin`

| ID | Requirement | Role | P |
|---|---|---|---|
| AD1 | Email + password login at `/admin/log-masuk`; no public sign-up | Both | M |
| AD2 | Dashboard home: counts and shortcuts to create an announcement or event | Both | M |
| AD3 | Announcements: list, create, edit, delete | Both | M |
| AD4 | Events: list, create, edit, delete | Both | M |
| AD5 | Settings: mosque name, address, phone, email, prayer zone, donation note | Superadmin | M |
| AD6 | Upload or replace the donation QR (PNG/JPG/WebP, max 2 MB) with preview before saving | Superadmin | M |
| AD7 | Users: create admin, disable/enable, delete, reset password | Superadmin | M |
| AD8 | Audit log view (who changed the QR, settings, or users, and when) | Superadmin | C |
| AD9 | Log out; sessions expire automatically | Both | M |
| AD10 | Org chart: upload, replace, delete a single image (PNG/JPG/WebP, max 4 MB) | Both | M |

### Permission matrix

| Capability | Admin | Superadmin |
|---|---|---|
| Create / edit / delete announcements | Yes | Yes |
| Create / edit / delete events | Yes | Yes |
| Upload / replace / delete the org chart | Yes | Yes |
| Replace donation QR | No | Yes |
| Change prayer zone | No | Yes |
| Edit site settings and donation note | No | Yes |
| Create / disable / delete admin accounts | No | Yes |
| Reset admin passwords | No | Yes |
| View audit log | No | Yes |

Permissions are enforced in the database (RLS) and in every server action, never only in the UI.

---

## 5. Non-functional requirements

- **Performance:** LCP under 2.5 s on a mid-range Android over 4G; public pages mostly static or cached.
- **Mobile-first:** designed at 360 px width first; touch targets at least 44 px.
- **Accessibility:** WCAG 2.1 AA; large base text (18 px) because many users are elderly; visible keyboard focus; respects reduced motion.
- **Time zone:** all dates shown in `Asia/Kuala_Lumpur`; stored as UTC (`timestamptz`).
- **Resilience:** prayer times keep working if JAKIM is down (saved copy).
- **Security:** see ARCHITECTURE.md; no public sign-up; RLS on every table; service key never in the browser.
- **Privacy:** no visitor tracking or analytics in v1. Location is requested only after the visitor taps the button and is never stored.
- **PWA:** installable (manifest, icons, cached app shell). No offline prayer times in v1. `/admin` is never cached.

---

## 6. Data (summary)

`profiles`, `announcements`, `events`, `site_settings` (one row), `org_chart` (one row), `prayer_times_cache`, `audit_log`, plus storage buckets `donation` and `org-chart`. Full schema is in ARCHITECTURE.md.

---

## 7. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Project setup | Next.js app runs locally and deploys to Vercel; Supabase projects created; env vars set |
| M1 | Database + auth | Migrations applied; RLS written; login works; role guard helper works |
| M2 | Admin CRUD | Announcements and events CRUD works for admin; settings and users work for superadmin |
| M3 | Prayer times | JAKIM fetch + cache + date browsing + countdown work; stale fallback verified |
| M4 | Public pages + design | All five pages built to DESIGN.md with real content |
| M5 | Donation + PWA | QR upload and display work; app installs on Android and iOS |
| M6 | Launch | Domain connected; first superadmin created; real content entered; checklist below passes |

---

## 8. Launch checklist

- [ ] Each role tested manually against the permission matrix (an admin cannot reach `/admin/tetapan`, `/admin/pengguna`, or upload a QR, even by calling the action directly)
- [ ] Public sign-up disabled in Supabase Auth
- [ ] Prayer times for the mosque zone match the official JAKIM site for 3 sample dates
- [ ] Prayer page still works when the JAKIM request is blocked (simulate failure)
- [ ] Site passes a mobile Lighthouse check (performance and accessibility at least 90)
- [ ] PWA installs on one Android phone and one iPhone
- [ ] All user-facing text is Bahasa Melayu
- [ ] Donation QR scans correctly from a second device in the actual banking app

---

## 9. Assumptions and open questions

Please answer these before M4. None block M0 to M3.

1. **Mosque name, address, contact details, logo** for site settings and the header.
2. **Which JAKIM zone?** Default assumed `SBH07` (covers Kota Kinabalu, Penampang, Tuaran, Papar, Kota Belud, Putatan, Ranau). Confirm it matches the mosque's location.
3. **Domain name.** Who registers and pays for it?
4. **Who is the first superadmin?** Recommend two people so access is never lost.
5. **Vercel plan.** The free Hobby plan is meant for personal, non-commercial use. Check Vercel's current terms to confirm a mosque site with a donation page fits, or budget for a paid plan or another host.
6. **Supabase free plan limits.** Check current limits, including whether inactive projects pause, before launch.
7. **"Use my location" mechanism.** JAKIM's own API takes a zone code, not coordinates. See ARCHITECTURE.md section 7 for the proposed approach and its risk.
8. **Initial content.** At least 3 announcements and 3 events so the landing page doesn't launch empty.

---

## 10. Out of scope, possible later

Imsak time, Jumaat khutbah posts, photo gallery, announcement images/categories/pinning, event RSVP, offline prayer times, push notifications for prayer time, Arabic or English versions, online donation tracking.