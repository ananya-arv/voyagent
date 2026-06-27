# Voyagent — AI travel planner

Voyagent collects trip preferences, asks Claude for a structured day-by-day
itinerary, renders it as a clean day-view, exports events as a `.ics` calendar
file, emails the itinerary via Resend, and sends a nightly "tomorrow's plan"
digest via a Vercel cron job. It also ships a conversational **Eve** agent
(`/chat`) that plans trips and saves them to the same database.

## Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind v4** + **shadcn/ui**
  (Base UI registry)
- **Auth0** via `@auth0/nextjs-auth0` v4
- **Supabase** (Postgres) through a typed helper layer in `lib/supabase/`
- **Anthropic Claude** (`claude-sonnet-4-6`) via the official SDK with
  **structured outputs** (`messages.parse` + `output_config.format`)
- **Resend** + **React Email** for the itinerary and digest emails
- **Sentry** (`@sentry/nextjs`) for error tracking
- **Vercel Cron** (`vercel.json`) for the nightly digest
- **Eve** (`eve.dev`) agent under `agent/`, mounted via `withEve` in
  `next.config.ts`, generating via **Vercel AI Gateway** (`anthropic/claude-sonnet-4.6`)

> **Note on versions:** `create-next-app@latest` produces Next 16 / React 19 /
> Tailwind v4, so this project uses the current stack rather than the Next.js 14
> named in the original brief. Consequently Auth0 uses SDK v4 (middleware-mounted
> `/auth/*` routes instead of an `/api/auth/[auth0]` handler), and env var names
> differ slightly (`APP_BASE_URL`, `AUTH0_DOMAIN`).

## Setup

1. **Install** (already done if you scaffolded here):

   ```bash
   npm install
   ```

2. **Environment:** copy `.env.local.example` to `.env.local` and fill in the
   values. The app boots with placeholders; only the live flows
   (Claude / AI Gateway / Resend / Auth0 / Supabase) need real keys.

3. **Database:** run `supabase/schema.sql` in the Supabase SQL editor (creates
   `users`, `trips`, `events`).

4. **Auth0:** create a Regular Web Application. Set the callback URL to
   `http://localhost:3000/auth/callback` and logout URL to
   `http://localhost:3000`. Put the domain/client id/secret + a generated
   `AUTH0_SECRET` (`openssl rand -hex 32`) in `.env.local`.

## Develop

```bash
npm run dev
```

`withEve` boots the Eve agent dev server alongside Next, so the web app and the
`/chat` agent run from one origin (`http://localhost:3000`). The Eve terminal
REPL is available separately with `npx eve dev`.

## Verify

- **Claude core** (de-risks generation before the UI):

  ```bash
  node --env-file=.env.local --import tsx scripts/test-claude.ts
  ```

- **Build / typecheck:** `npm run build`
- **Eve agent discovery:** `npx eve info` (should report `0 errors`)
- **Calendar export:** open a trip → "Download calendar" → opens in any calendar app
- **Email:** "Email itinerary" on a trip → `{ success: true }`
- **Cron:** `POST /api/cron/daily-digest` returns 401 without the secret; with
  `Authorization: Bearer $CRON_SECRET` it sends tomorrow's digests. Vercel Cron
  (configured in `vercel.json`, `0 20 * * *`) sends this header automatically.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Hero + "Plan my trip" CTA |
| `/plan` | Intake form → `POST /api/generate-itinerary` → `/trips/[id]` |
| `/trips` | List of the user's saved trips |
| `/trips/[id]` | Day-view itinerary + download/email actions |
| `/chat` | Conversational Eve agent that plans and saves trips |
| `POST /api/generate-itinerary` | Claude generation + persist |
| `GET /api/export-ics/[tripId]` | `.ics` download |
| `POST /api/send-itinerary/[tripId]` | Email the itinerary |
| `GET\|POST /api/cron/daily-digest` | Nightly digest (CRON_SECRET-gated) |

## Architecture notes

- All DB access goes through `lib/supabase/queries.ts`; the Claude prompt lives
  in `lib/prompts/itinerary.ts`; both the direct-SDK path (`lib/claude.ts`) and
  the Eve agent reuse this shared material.
- The Eve agent generates via AI Gateway and persists with the strict-zod
  `save_itinerary` tool, which calls the same `lib/supabase/queries.ts` — no
  duplicated DB logic. It passes the authenticated user through `clientContext`.
- **Production hardening for `/chat`:** the Eve channel (`agent/channels/eve.ts`)
  uses placeholder auth that only opens on localhost. For production, map the
  Auth0 session to the Eve channel auth and read identity from
  `ctx.session.auth` instead of trusting `clientContext` — see
  `agent/` and Eve's "Auth & route protection" guide
  (`node_modules/eve/docs/guides/auth-and-route-protection.md`).
