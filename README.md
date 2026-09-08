# CTPMI Website

Design scaffold for `ctpmi.online` — the web front-end for the daily verse,
Bible quiz, and leaderboard. This is a **visual scaffold only**: pages
render with mock data and every screen that needs a live n8n endpoint says
so on the page itself. No backend wiring is done yet.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS with CTPMI brand tokens (`tailwind.config.ts`)
- Fonts: Bricolage Grotesque (display/headings), Inter (body) — loaded via
  `next/font/google` in `app/layout.tsx`

## Pages

| Route | Status |
|---|---|
| `/` | Home — verse hero + quiz CTA, mock data |
| `/login` | Phone number entry with live SA-mobile validation, not yet wired to a login endpoint |
| `/quiz` | Question card shell, progress dots, countdown ring — one mock question |
| `/leaderboard` | Tabs + Top 10 / Most Dedicated / Perfect Scores / Quickest sections, mock Top 10 only |
| `/verse` | Verse archive, mock entries |
| `/profile` | Member stats shell, all zeros until login is wired up |

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

1. `NEXT_PUBLIC_N8N_BASE_URL` env var + the five webhook endpoints listed
   in `.env.example` (`GET /web/quiz/today`, `POST /web/quiz/answer`,
   `GET /web/leaderboard`, `GET /web/verse`, `POST /web/login`)
2. Session handling after phone login (cookie, no OTP for now — see
   project notes on the identity-verification tradeoff)
3. Wiring `/login`'s "not found" path to the onboarding form
4. Real quiz state (timer countdown, answer submission, scoring) on `/quiz`
5. Live leaderboard data + tab switching on `/leaderboard`

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
