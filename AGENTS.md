# AGENTS.md

Instructions for AI coding agents working on the mosque website.

## Read first
1. `ARCHITECTURE-ESSENTIALS.md`: read at the start of **every** task.
2. `PRD.md`: scope. If a request is not in the PRD, ask before building it.
3. `ARCHITECTURE.md`: read when touching the database, auth, prayer times, uploads, caching, or PWA.
4. `DESIGN.md`: read when touching anything visual or any user-facing text.

If two docs disagree, stop and ask. Do not pick silently.

## About the owner
The owner knows Laravel and PHP well but is new to Next.js. When you introduce a Next.js or React concept, explain it in one or two sentences and map it to a familiar idea when that helps (for example, a server action is roughly a controller method; `requireRole()` is roughly middleware plus a policy). Prefer boring, conventional patterns over clever ones.

## Language rules
- Code, comments, commit messages, and docs: English.
- Everything the visitor or admin sees: Bahasa Melayu, sentence case, plain words. See the copy rules in `DESIGN.md`.

## Code rules
- TypeScript `strict`. No `any` unless commented with the reason. No `@ts-ignore` without a comment.
- Validate all external input with Zod: forms, server action arguments, JAKIM responses, uploaded files.
- Server components by default. Add `'use client'` only when you need state, effects, or browser APIs, and keep those components small.
- All writes go through server actions in `src/actions/`. Each one starts with `requireRole()`, then validates, then writes.
- Use the user's Supabase client so RLS applies. The service-role client is allowed only where `ARCHITECTURE.md` section 5 says so.
- Dates and times: use the helpers in `src/lib/time.ts`; always `Asia/Kuala_Lumpur`.
- No `dangerouslySetInnerHTML`.
- Tailwind classes use the tokens from `DESIGN.md`; do not hard-code hex values in components.
- Keep files small and named by what they do. No dead code or commented-out blocks.

## Choosing libraries
You may pick libraries yourself. For **every new dependency**, say in your reply:
1. What it does and why you need it.
2. The simplest alternative you considered (including "write it ourselves") and why you did not choose it.
3. Its approximate size or maintenance status if it is not obviously mainstream.

Prefer fewer dependencies. Do not add a library for something under about 30 lines of code.

## Verify, don't assume
- Next.js and Supabase APIs change between versions. Check the installed version in `package.json` and read that version's docs before using caching, middleware/proxy, cookies, or auth helpers.
- The JAKIM API has no stable official contract. Confirm the real response shape with an actual request before writing the parser, then encode it in the Zod schema.
- If you cannot verify something, say so plainly and mark the code with a `TODO(verify)` comment.

## Security boundaries (non-negotiable)
These come from `ARCHITECTURE-ESSENTIALS.md` and apply to every change:
- Authorization happens in the server action or page and in RLS, never only in the UI.
- Service-role key is server-only.
- Admins cannot touch the donation QR, prayer zone, site settings, or users.
- No secrets in code, logs, or commits.

If a task seems to require breaking one of these, stop and explain the conflict.

## Working style
- Work in small steps matching the milestones in `PRD.md`. Finish one milestone before starting the next.
- Before a big change (new table, new route, auth change), give a short plan and wait for approval.
- After each step, say what changed, how to run or test it, and what is still missing.
- Do not refactor unrelated code or reformat files you did not need to touch.
- If you make a mistake or find one, say so and fix it. Do not hide it.

## Commands
```
pnpm dev          # local dev server
pnpm build        # production build
pnpm lint         # lint
pnpm typecheck    # tsc --noEmit
supabase db push  # apply migrations (dev project first)
```
Add a `typecheck` script if it does not exist yet.

## Definition of done
A task is done when:
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass.
- [ ] The feature works at 360 px width and at desktop width.
- [ ] All new user-facing text is Bahasa Melayu and follows `DESIGN.md`.
- [ ] Any new table has RLS enabled with policies, and a migration file.
- [ ] Role-restricted features were checked as both admin and superadmin (and as a logged-out visitor).
- [ ] No new dependency without the explanation above.
- [ ] You listed anything you could not verify.

## Do not
- Do not add features outside `PRD.md` (images on announcements, RSVP, analytics, i18n, offline prayer times, and so on) without asking.
- Do not change the stack, folder layout, or roles without asking.
- Do not edit the production database by hand or suggest doing so.
- Do not commit `.env*` files other than `.env.example`.