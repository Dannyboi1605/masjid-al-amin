# DESIGN: Laman Web Masjid

Direction: **classic Islamic, green and gold, with geometric patterns.**
Subject: a community mosque. Audience: jemaah of all ages, mostly on phones, many elderly. Primary job: show today's prayer times instantly and calmly.

## Principles
1. **The mosque welcomes; the prayer times follow.** The hero is one real photo of this mosque with its name. The prayer band sits immediately below it: the next prayer, its time, and a live countdown. The photo must be this mosque, never stock or generated.
2. **Spend the boldness in one place.** The photo and the prayer band are the bold moment. The geometric star pattern and the gold appear as thin dividers and accents. Everything else is quiet, readable, and generous with space.
3. **Pattern never sits behind body text.** It is decoration for edges and bands only.
4. **Large and legible.** 18 px base text, high contrast, 44 px touch targets.
5. **Structure carries meaning.** Borders, dividers, and date blocks exist because they organize content, not to decorate it.
6. **Restraint.** No gradients as decoration, no stacks of identical shadowed cards, no scattered animation. A photo scrim is allowed only where it protects text contrast.

---

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `--hijau-malam` | `#0B3D2E` | Prayer band and footer background, headings on light, primary buttons |
| `--hijau-daun` | `#1E6B52` | Links, secondary buttons, active states, icons |
| `--emas-cerah` | `#D9B35A` | Gold on dark backgrounds: pattern lines, next-prayer highlight, focus ring on dark |
| `--emas-tua` | `#7A5A16` | Gold on light backgrounds: dividers, small accents, focus ring on light |
| `--kapur` | `#F3F6F1` | Page background (a pale green-white, not cream) |
| `--tinta` | `#14221C` | Body text |
| `--garis` | `#CBD6CE` | Borders and rules on light |
| `--putih` | `#FFFFFF` | Admin surfaces, QR tile |
| `--ralat` | `#A32020` | Errors |

Contrast rules (verify each pair with a contrast checker when implementing):
- `--tinta` on `--kapur`: body text.
- White or `--emas-cerah` on `--hijau-malam`: allowed for text of any size.
- `--hijau-daun` on `--kapur`: allowed for text and links.
- `--emas-tua` on `--kapur`: allowed for text of 18 px and up and for rules.
- Never use `--emas-cerah` on a light background; never use `--emas-tua` on dark.

Tailwind: define these as theme colors (`hijau-malam`, `hijau-daun`, `emas-cerah`, `emas-tua`, `kapur`, `tinta`, `garis`, `ralat`). Components use the names, never raw hex.

---

## Typography

Load with `next/font/google`, subset `latin` (plus `arabic` for Amiri).

| Role | Family | Notes |
|---|---|---|
| Headings, prayer names, Arabic text, hero name | **Amiri** | Classical naskh serif; covers Latin and Arabic so headings and Arabic phrases match |
| Body, UI, forms, numbers | **Alegreya Sans** | Humanist sans with calligraphic roots; clearly different from Amiri |

Prayer times use `font-variant-numeric: tabular-nums` so columns align.

| Style | Mobile | Desktop | Family / weight | Line height |
|---|---|---|---|---|
| Welcome label | 1rem | 1.125rem | Alegreya Sans 600 | 1.2 |
| Hero name | 3rem | 5rem | Amiri 700 | 1.05 |
| Next prayer time (band) | 3rem | 4.5rem | Amiri 700 | 1.05 |
| h1 | 2.25rem | 3rem | Amiri 700 | 1.15 |
| h2 | 1.75rem | 2.25rem | Amiri 700 | 1.2 |
| h3 | 1.375rem | 1.5rem | Amiri 700 | 1.3 |
| Body | 1.125rem (18 px) | 1.125rem | Alegreya Sans 400 | 1.55 |
| Small | 0.9375rem | 0.9375rem | Alegreya Sans 400 | 1.45 |
| Button / label | 1rem | 1rem | Alegreya Sans 600 | 1.2 |

Rules:
- Line length at most 70 characters (`max-w-[68ch]` for reading text).
- Sentence case everywhere. No all-caps labels, no letter-spaced eyebrows above headings.
- Arabic text: wrap in `<span lang="ar" dir="rtl">` and use Amiri at 1.25 times the surrounding size.
- `<html lang="ms">`.

---

## Shape, spacing, depth

- Spacing scale: 4 px base (`1, 2, 3, 4, 6, 8, 12, 16` Tailwind steps). Section padding: 48 px mobile, 80 px desktop.
- One radius only: `4px` for controls (buttons, inputs). Everything else is square-cornered.
- No drop shadows. Separate with `--garis` borders and background changes.
- Page max width: 1120 px. Reading column: 68ch.

---

## Geometric pattern

One motif: an eight-point star (two overlapping squares, one rotated 45 degrees, with a small centre circle), repeated as a tile. Starter tile (a designer can refine it later):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#D9B35A" stroke-width="1">
  <rect x="10" y="10" width="28" height="28"/>
  <rect x="10" y="10" width="28" height="28" transform="rotate(45 24 24)"/>
  <circle cx="24" cy="24" r="4"/>
</svg>
```

Use it in exactly three places:
1. A 12 px divider band between the prayer band and the landing page content, at full opacity in `--emas-cerah`.
2. The footer top edge.
3. The loading prayer band, over `--hijau-malam`, at 8 to 10 percent opacity.

Not over the mosque photo, not on cards, not behind text blocks, not in the admin.

---

## Photography

- One real photo of this mosque. No stock photo and no generated image.
- Landscape, at least 1600 px wide, natural colour, with space for text. Avoid watermarks, heavy HDR, and tilted horizons.
- Use `next/image` with `preload`, responsive `sizes`, and a compressed local asset.
- A subtle neutral dark scrim and text shadow protect the text. The scrim is a contrast device, not decoration, and must not tint the photo. Verify the brightest area behind the text.
- Alt text in Bahasa Melayu describes the mosque, for example "Bangunan Masjid Al-Amin Kg Serigai Putatan pada waktu siang."
- Never cover the photo with the star pattern, cards, or glass.

---

## Layout

### Landing page (mobile first)

```
+--------------------------------+
| [logo] Masjid ...        [menu]|   header, hijau-malam
+--------------------------------+
|                                |
|       Selamat datang ke        |
|       Masjid Al-Amin           |   hero: real photo, neutral dark scrim
|       Kg Serigai Putatan       |   Amiri, centred, text at the bottom
|                                |
+--------------------------------+
| Waktu solat hari ini           |
| Zohor                          |
| 12:31   dalam 1j 24m           |   prayer band, hijau-malam
| Subuh Syuruk Zohor Asar ...    |   six times in a grid, next one gold
| [Lihat waktu solat penuh]      |
+==== gold geometric band =======+
| Pengumuman terkini             |
| 12 Okt  Kuliah Maghrib ...     |   ruled list, date column + title + excerpt
| 10 Okt  Gotong-royong ...      |
| Lihat semua pengumuman         |
+--------------------------------+
| Program akan datang            |
| [18] Sabtu  Majlis Ilmu ...    |   date block (day number over month) + details
| [25] Sabtu  ...                |
+--------------------------------+
| Sumbangan                      |
| Sumbangan anda membantu ...    |
| [Lihat kod QR]                 |
+--------------------------------+
| footer: address, phone, email  |
+--------------------------------+
```

Desktop: the photo stays full-bleed with the welcome at the bottom centre. The prayer band below puts the next prayer on the left and the six times in a three-column grid on the right. Announcements and events sit side by side below the band, with announcements slightly wider.

Alignment: left-aligned text throughout, except the hero welcome and the donation QR page, which centre their content.

### Prayer times page `/waktu-solat`
Top: zone name and date, with previous-day and next-day buttons and a date picker. Below: the six times as a table (name left, time right, tabular figures); today's next prayer row gets a pale green tint, a green left rule, and the countdown inside the row. Under the table: "Guna lokasi saya" button and a zone dropdown. A notice appears above the table when data is stale.

### Announcements and events pages
Announcements: ruled list, newest first. Each row has the date in a narrow left column and the title and excerpt on the right, with a `--garis` rule between rows.
Events: each row has a date block on the left (`--hijau-malam` square, white day number over the month in Amiri), then title, time, location, description.

### Donation page `/sumbangan`
Centred. QR on a white tile with a 2 px `--emas-tua` frame and 24 px padding, at least 280 px wide on mobile. The instruction text sits above it, "Muat turun kod QR" button below.

### Admin
Quieter than the public site: white surfaces on `--kapur`, `--garis` borders, tables for lists, no pattern, no gold except the focus ring. Sidebar on desktop, top bar with a menu on mobile. Superadmin-only sections (Tetapan, Pengguna, Log audit) are not shown to admins at all.

---

## Components

- **Buttons:** primary = `--hijau-malam` fill, white text; secondary = `--hijau-daun` outline; destructive = `--ralat` fill. Height 48 px, radius 4 px. Label says what happens ("Simpan perubahan", "Padam pengumuman").
- **Inputs:** 48 px high, 1 px `--garis` border, label always visible above the field, error text below in `--ralat` with an icon, never color alone.
- **Links:** `--hijau-daun`, underlined.
- **Focus:** 3 px outline, offset 2 px; `--emas-tua` on light, `--emas-cerah` on dark. Never removed.
- **Dialogs:** used only for delete confirmation.
- **Toasts:** confirm admin actions, matching the button verb.

---

## Motion

- One moment only: the countdown ticks each second. Nothing else animates on page load.
- Responses to the person's actions (opening the menu, expanding "Program lepas", form feedback) may use a 150 to 200 ms transition.
- No entrance fades or slide-ups, no hover animation on every card.
- Respect `prefers-reduced-motion`: disable all non-essential transitions.

---

## Copy (Bahasa Melayu)

Rules: sentence case, plain verbs, active voice, no filler, no exclamation marks. Name things by what visitors understand. An action keeps the same name across button, toast, and confirmation.

| Where | Text |
|---|---|
| Nav | Utama, Pengumuman, Waktu solat, Program, Sumbangan |
| Prayer names | Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak |
| Hero label | Selamat datang ke |
| Prayer band heading | Waktu solat hari ini |
| Prayer band label | Seterusnya |
| Countdown | dalam 1j 24m |
| Location button | Guna lokasi saya |
| Empty announcements | Belum ada pengumuman. Sila semak semula nanti. |
| Empty events | Tiada program akan datang buat masa ini. |
| Empty donation | Kod QR belum dimuat naik. Sila hubungi pihak masjid. |
| Stale prayer data | Waktu solat tidak dapat dikemas kini. Memaparkan data yang disimpan pada {tarikh}. |
| Date unavailable | Waktu solat untuk tarikh ini belum tersedia. |
| Save | Simpan perubahan, toast: Perubahan disimpan |
| Create | Tambah pengumuman, toast: Pengumuman ditambah |
| Delete | Padam pengumuman, confirm: Padam pengumuman ini? Tindakan ini tidak boleh dibatalkan. |
| Login error | E-mel atau kata laluan tidak betul. |
| No permission | Anda tidak mempunyai kebenaran untuk halaman ini. |
| Generic error | Sesuatu tidak berjalan lancar. Sila cuba lagi. |

Errors say what happened and what to do next. They never apologize and never show technical detail.

---

## Accessibility checklist

- [ ] Text contrast meets WCAG AA (4.5:1 normal, 3:1 large), including text over the photo scrim at its brightest point
- [ ] All controls reachable and operable by keyboard, with visible focus
- [ ] Touch targets at least 44 by 44 px
- [ ] Meaning never conveyed by color alone (next prayer also has a label, errors also have an icon and text)
- [ ] Countdown is not announced every second (use `aria-live="off"`; announce the next prayer name and time once)
- [ ] Images have alt text; the QR alt is "Kod QR DuitNow untuk sumbangan"
- [ ] `lang="ms"` on the page, `lang="ar"` on Arabic spans
- [ ] Works at 200 percent zoom without horizontal scroll

---

## Self-critique before shipping

Check the built pages against these questions and fix what fails:
1. Would the hero look the same with any other mosque's name and photo? If so, it is too generic. It should feel like this mosque.
2. Is the pattern used in more than the three allowed places?
3. Are there identical shadowed cards, decorative gradient washes, all-caps labels, or "word + arrow" buttons? Remove them.
4. Can an elderly user read every line without zooming?
5. Remove one decorative element.