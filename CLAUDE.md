# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Next dev server; withEve boots the Eve agent dev server alongside it (one origin)
npm run build    # next build — also compiles the Eve agent and runs full TS typecheck
npm run lint     # eslint
npx eve info     # validate Eve agent discovery/compile (expect "0 errors"); writes artifacts to .eve/
npx eve dev      # Eve agent terminal REPL (separate from `next dev`)

# Verify Claude generation in isolation (needs a real ANTHROPIC_API_KEY):
node --env-file=.env.local --import tsx scripts/test-claude.ts
```

There is no automated test suite. `npm run build` is the primary correctness gate (it typechecks every route, component, and Eve tool). Env setup: `cp .env.local.example .env.local`; the app boots with placeholders, so only live flows need real keys. The DB schema in `supabase/schema.sql` must be run manually in Supabase.

## Stack reality vs. the original brief

This was scaffolded with `create-next-app@latest`, so it runs **Next.js 16 / React 19 / Tailwind v4**, not Next 14. Consequences that bite:

- **Auth0 is SDK v4.** Routes are middleware-mounted at `/auth/*` (login/logout/callback) — there is **no** `app/api/auth/[auth0]` handler. Env names differ from the brief: `APP_BASE_URL` (not `AUTH0_BASE_URL`), `AUTH0_DOMAIN` (host only, not `AUTH0_ISSUER_BASE_URL`).
- **shadcn/ui uses the Base UI registry**, not Radix. `Button` has **no `asChild` prop** and `Select`/`RadioGroup` `onValueChange` emit `string | null`. To render a link styled as a button, apply `buttonVariants({...})` to an `<a>`/`<Link>` directly (see `components/SiteHeader.tsx`).
- `middleware.ts` works but Next 16 prints a "use proxy instead" deprecation warning — harmless.

## Architecture

Two AI entry points share one persistence layer and one prompt source:

1. **Form path (spec-canonical):** `/plan` → `POST /api/generate-itinerary` → `lib/claude.ts` `generateItinerary()`. Uses the **direct Anthropic SDK** (`claude-sonnet-4-6`) with **structured outputs** (`messages.parse` + `zodOutputFormat`) — output validity is guaranteed by schema, not by "return only JSON" prompting. On refusal/parse failure it throws `ItineraryGenerationError` and captures the raw response to Sentry.
2. **Chat path (Eve agent):** `/chat` → `useEveAgent` (`eve/react`) → the agent under `agent/`. The agent generates via **Vercel AI Gateway** (`anthropic/claude-sonnet-4.6` — note the dotted id, distinct from the direct SDK's `claude-sonnet-4-6`) and persists by calling its strict-zod `save_itinerary` tool.

Both write through **`lib/supabase/queries.ts`** — the single data-access layer; never inline Supabase queries in routes or tools. Both draw prompt material from **`lib/prompts/itinerary.ts`** (system prompt + booking-URL rules); keep `agent/instructions.md` in sync with it.

### Eve agent specifics (`agent/`)

- `withEve(...)` in `next.config.ts` mounts the agent's `/eve/v1/*` routes on the Next origin and is itself wrapped by `withSentryConfig`. The agent compiles as part of `next build`.
- Tools (`agent/tools/*.ts`, filename = tool name) run in the app runtime and import `@/lib/*` directly — that is why those lib modules **must not** use the `server-only` package (Eve's bundler throws on it; the guard remains only in `lib/session.ts`, which Eve doesn't bundle). `lib/supabase/server.ts`, `queries.ts`, and `email.ts` carry an explanatory comment about this.
- User identity reaches `save_itinerary`/`list_trips` via `clientContext` from `components/Chat.tsx`. **This is dev-grade trust:** `agent/channels/eve.ts` uses placeholder auth open only on localhost. Production must map the Auth0 session into the Eve channel and read identity from `ctx.session.auth`, not `clientContext`. See `node_modules/eve/docs/` (bundled, version-matched) for the auth guide.

### Key files

- `lib/types.ts` — domain types + the `GeneratedItinerary` shape both AI paths produce.
- `lib/itinerary-utils.ts` — `groupByDay`, `totalEstimatedCost`, `formatDate`, category icons, `appBaseUrl()`; shared by pages and email templates.
- `lib/observability.ts` — `captureError()`: dynamic-imports Sentry so it no-ops in the plain `tsx` script.
- `app/api/cron/daily-digest/route.ts` — gated on `Authorization: Bearer ${CRON_SECRET}`; `vercel.json` cron (`0 20 * * *`) sends that header. Exports both GET and POST.
- Identity model: Auth0 `sub` is the `users.id` primary key (text, not uuid) and the `trips.user_id` FK.
