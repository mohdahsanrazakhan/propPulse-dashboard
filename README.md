# PropPulse

Know your numbers. Close more deals.

A performance analytics dashboard for Dubai real estate agencies.
Track agent performance, lead conversion, commission, and deal pipeline
with AI-powered insights.

<!-- ## Screenshots
[Add after build] -->

## Features
- Agency-wide KPI dashboard
- Agent performance tracking with leaderboard
- Deal pipeline (Kanban + table view)
- Lead source ROI analysis
- Commission calculator and tracker
- Community/area performance analysis
- AI-powered performance insights
- Dubai-specific: RERA, 2% sales / 5% rentals, AED, co-broker splits

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- MongoDB + Mongoose
- NextAuth.js (Auth.js v5, Credentials + JWT)
- OpenAI API (gpt-4o-mini)
- Recharts

## Setup
1. Clone, `npm install`
2. Copy `.env.example` → `.env` and fill in `MONGODB_URI`, `AUTH_SECRET`
   (generate with `openssl rand -base64 32`), and optionally `OPENAI_API_KEY`
3. `npx tsx scripts/seed.ts`
4. `npm run dev`
5. Login: `demo@proppulse.com` / `PropPulse@2026!`

## Seed data
The seed script generates a full year of realistic demo data for a small
Dubai agency: 8 agents with deliberately distinct performance profiles,
2,400 leads, 320 completed deals + 85 in-pipeline deals, ~58 active listings,
and 15 pre-generated AI insights. Re-run `npx tsx scripts/seed.ts` anytime to
reset, or use the "Reset Demo Data" button in Settings.

## Security
- NextAuth.js JWT sessions (24h max age), Credentials provider, bcrypt-hashed
  passwords
- Login rate limiting (5 attempts / 15 min / IP + email)
- All API routes require a valid session and validate input with Zod
- Security headers via middleware (CSP, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy, HSTS)
- MongoDB access via `MONGODB_URI` env var only, strict Mongoose schemas,
  indexed fields
- OpenAI API key is server-side only, requests are capped (`max_tokens`) and
  user-influenced input is sanitized before being sent
- Generic error messages returned to the client; details are logged
  server-side only
- `.env.example` documents all variables; `.env`/`.env.local` are gitignored

## Project structure
- `src/app/`: App Router pages and API routes
- `src/components/`: feature components, `shared/` building blocks, `ui/` primitives
- `src/hooks/`: one data-fetching hook per feature area
- `src/lib/`: db, auth, validators, calculators, constants
- `src/models/`: Mongoose schemas
- `src/seed/`: demo data generation
- `messages/`: `en` / `ar` i18n strings

## License
MIT
