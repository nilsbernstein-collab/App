/**
 * POST /api/checkout/session
 *
 * Mock server-side handler for creating a Stripe Checkout Session for a
 * NicheTrack Pro subscription. Not wired to any framework — copy the body
 * into an Express/Fastify/Next.js route handler.
 *
 * Client counterpart: src/lib/checkout.ts (currently a client-side mock with
 * an artificial delay, returning fake IDs instead of calling this route).
 */

interface CheckoutSessionRequestBody {
  interval: 'monthly' | 'yearly'
  /** The signed-in user's id in your own auth system, used to look up/create a Stripe customer. */
  userId: string
}

interface CheckoutSessionResponseBody {
  checkoutUrl: string
}

// Price IDs are created once in the Stripe Dashboard (Products -> Pricing) and
// referenced by ID here — never hardcode amounts server-side, Stripe is the
// source of truth for what a customer is actually charged.
const STRIPE_PRICE_IDS = {
  monthly: 'price_REPLACE_WITH_MONTHLY_PRICE_ID',
  yearly: 'price_REPLACE_WITH_YEARLY_PRICE_ID',
}

export async function createCheckoutSessionHandler(
  body: CheckoutSessionRequestBody,
): Promise<CheckoutSessionResponseBody> {
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-XX-XX' })
  //
  // const customer = await findOrCreateStripeCustomer(body.userId)
  //
  // const session = await stripe.checkout.sessions.create({
  //   mode: 'subscription',
  //   customer: customer.id,
  //   line_items: [{ price: STRIPE_PRICE_IDS[body.interval], quantity: 1 }],
  //   success_url: `${process.env.APP_URL}/settings?checkout=success`,
  //   cancel_url: `${process.env.APP_URL}/settings?checkout=cancelled`,
  //   metadata: { userId: body.userId },
  // })
  //
  // return { checkoutUrl: session.url! }

  throw new Error(
    `Not implemented — this is a reference stub. Selected price: ${STRIPE_PRICE_IDS[body.interval]}`,
  )
}
