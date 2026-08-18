# Server Stubs

NicheTrack is currently a client-only, offline-first app (Vite + IndexedDB via
Dexie) — there is no server in this repo yet. This folder is **not** built or
run by the app; it exists purely as a reference for the backend surface that
would replace `src/lib/checkout.ts`'s mock `createCheckoutSession()` and the
IndexedDB repositories in `src/data/repositories/` once a real backend is
introduced (see the root README's "Von Offline-First zu Backend" section).

The code here is intentionally framework-agnostic pseudocode — Express,
Fastify, and Next.js/Remix route handlers all fit this shape with minor
adjustments. Each file documents, in comments, exactly where a real Stripe
secret key and webhook signing secret would be read from environment
variables, and where real business logic (persisting to Postgres/Supabase,
etc.) would go.

- `routes/checkout.ts` — creates a Stripe Checkout Session for a Pro subscription.
- `routes/stripeWebhook.ts` — receives Stripe subscription lifecycle events.
- `routes/integrations.ts` — REST surface for the Pro "API-Zugang" feature
  (future bank / Shopify data connections).

## Wiring this up for real

1. `npm install stripe` on the server.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as server-side env vars
   — never in the Vite client bundle.
3. Replace `src/lib/checkout.ts`'s mock implementation with a `fetch('/api/checkout/session')`
   call, and redirect the browser to the returned Stripe-hosted checkout URL
   (or mount Stripe Elements client-side and confirm the PaymentIntent
   returned by this stub).
4. Point Stripe's webhook settings at `/api/webhooks/stripe` in the deployed backend.
