# Toroglo web

Next.js (App Router) e-commerce app: MongoDB/Mongoose, NextAuth, Paystack, Resend, optional Upstash Redis.

## Operations

| Concern | Notes |
|--------|--------|
| **Env** | `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`, optional `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, optional `RESEND_WEBHOOK_SECRET` for delivery webhooks at `/api/webhooks/resend`. |
| **DB** | One logical pool: Mongoose is primary; native `MongoClient` for NextAuth and OTP/order counters comes from the same connection (`lib/db/mongodb.ts`). |
| **Notifications** | No Agenda/worker — outbound email/SMS runs after the response via Next `after()` (`lib/jobs/queue.ts`). Set `NOTIFICATIONS_SYNC=1` to await sends (e.g. scripts). |
| **Redis** | If Upstash env vars are unset, rate limits fall back to in-memory (`lib/ratelimit.ts`) — fine for single-node, not for multi-instance. |
| **Tests** | `yarn test` (Jest; default suite avoids Mongo). OTP persistence tests run when `RUN_DB_TESTS=1` and MongoDB is reachable. `yarn eslint . --quiet` fails CI on errors only (full `yarn lint` includes warnings). `yarn test:e2e` (Playwright; start dev server first or set `PLAYWRIGHT_BASE_URL`). |

## Scripts

- `yarn dev` / `yarn build` / `yarn start`
- `yarn lint`
- `yarn seed` — seed Mongo (see `scripts/seed.ts`)

## Enterprise checklist

- [ ] Configure Resend + Paystack live keys in production.
- [ ] Point `RESEND_WEBHOOK_SECRET` at the Resend signing secret and monitor bounces.
- [ ] Run Playwright smoke against staging before release.
