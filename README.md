# CTPMI Website

`ctpmi.online` — the web front-end for the daily verse, Bible quiz, and
leaderboard. Wired to the live `CTPMI Web API` n8n workflow: no mock data,
no timer (matching the WhatsApp bot, which had its timer removed
2026-09-08). Login is phone-number only, no OTP — see the note in
`components/PhoneInput.tsx` and the project history for that tradeoff.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS with CTPMI brand tokens (`tailwind.config.ts`)
- Fonts: Bricolage Grotesque (display/headings), Inter (body) — loaded via
  `next/font/google` in `app/layout.tsx`

## Pages

| Route | Status |
|---|---|
| `/` | Home — real verse of the day, real quiz status/streak count |
| `/login` | Phone number entry, calls `POST web/login`, routes to `/register` if not found |
| `/register` | Full onboarding form (mirrors WhatsApp bot's fields), calls `POST web/register` |
| `/quiz` | Real 5-question quiz from `GET web/quiz/today` — **no timer**, all questions shown at once, submit together via `POST web/quiz/answer` |
| `/leaderboard` | Live data from `GET web/leaderboard`, tabs actually switch range |
| `/verse` | Real verse of the day from `GET web/verse` (12-verse static rotation — not yet AI-generated, see Not yet built) |
| `/profile` | Real session + quiz stats, logout |

Session is client-side only (`lib/session.tsx`, localStorage) — there's no
server-side auth. Anyone who knows a member's number can "log in" as them;
this is a known, accepted tradeoff for the MVP (no OTP yet).

## Shared source of truth (by design)

This site is intentionally presentation-only. It does **not** duplicate
quiz logic, scoring, or leaderboard ranking — those stay in n8n, in the
same tables the WhatsApp bot already uses:

- `Bible Quiz Questions` / `Bible Quiz Progress` — same 5 daily questions
  as WhatsApp, same scoring. The web quiz is a new UI on the same data,
  not a separate quiz.
- `Quiz Leaderboard History` + the bot's `total_correct desc, total_played
  desc` comparator — same ranking rule as the WhatsApp `leaderboard`
  command and the Reporting Portal.
- `Church Members` / `Registration Progress` — login checks against
  `Church Members`; unregistered numbers go through the same onboarding
  questions as the WhatsApp bot, in the same order.

## Not yet built (next steps)

1. Verse archive (currently today-only; the 12-verse rotation is a
   placeholder — the WhatsApp bot generates its verse live via AI on
   request, so the two aren't the same content yet)
2. OTP-based login (currently phone number only, no verification)
3. Streak tracking on the home page (backend doesn't compute a streak yet)
4. Registration doesn't clear a matching `Registration Progress` row if
   someone had a stalled WhatsApp signup under the same number

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Deployment

This repo is linked to the existing Vercel project
`conquering-through-prayer-ministries-international`, which already owns
the `ctpmi.online` domain. Pushes to `main` deploy automatically.

## Original site content

`original-site/index.html` is the church's original single-page marketing
site, saved verbatim as a backup. **It's now also live as the homepage**
(`/`) — rendered exactly as designed via `components/OriginalSite.tsx`,
with its own header/nav/footer intact. Three new links were added into
that existing nav bar (Bible Quiz, Leaderboard, Daily Word), styled to
match the existing nav items with a small teal accent dot.

## Site structure

- `/` — the original marketing site (About/Services/Prayer Cells/Events/
  Watch/The Word/Bot Demo/Contact), untouched apart from the three new nav
  links. Its own CSS (`app/original-site.css`) and inline `<script>`
  (year stamp, mobile burger menu, scroll reveals, WhatsApp bot demo
  widget) are preserved and still run.
- `app/(app)/` — a route group for everything quiz-related
  (`/today`, `/quiz`, `/leaderboard`, `/verse`, `/profile`, `/login`,
  `/register`). These share a separate, simpler nav (`components/Header.tsx`)
  and are the only pages wired to the live `CTPMI Web API` n8n endpoints.

**Why the split matters:** Next.js treats any plain CSS import as global,
not scoped to one page. `original-site.css` is only imported by `/`, and
the boundary link back to it (the "CTPMI" brand link in the app header)
deliberately uses a plain `<a>` tag instead of `next/link`'s `<Link>` to
force a full page reload — this keeps that stylesheet from leaking into
the app pages during client-side navigation. Don't change that link to
`<Link>` without addressing the CSS scoping first.
