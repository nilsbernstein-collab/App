/**
 * POST /api/webhooks/stripe
 *
 * Mock webhook handler skeleton for Stripe subscription lifecycle events.
 * Register this URL in the Stripe Dashboard (Developers -> Webhooks) once a
 * real backend exists. Must receive the *raw* request body (no JSON body
 * parser in front of it) so the signature can be verified.
 */

interface RawWebhookRequest {
  rawBody: Buffer | string
  headers: Record<string, string | string[] | undefined>
}

export async function stripeWebhookHandler(_req: RawWebhookRequest): Promise<{ status: number }> {
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-XX-XX' })
  // const signature = req.headers['stripe-signature']
  //
  // let event: Stripe.Event
  // try {
  //   event = stripe.webhooks.constructEvent(req.rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
  // } catch (err) {
  //   return { status: 400 } // invalid signature — reject
  // }
  //
  // switch (event.type) {
  //   case 'checkout.session.completed': {
  //     const session = event.data.object as Stripe.Checkout.Session
  //     // Look up the user via session.metadata.userId, then:
  //     // await db.subscriptions.upsert({ userId, tier: 'pro', stripeCustomerId: session.customer, stripeSubscriptionId: session.subscription })
  //     break
  //   }
  //   case 'invoice.paid': {
  //     // Extend currentPeriodEnd for the subscription tied to event.data.object.subscription
  //     break
  //   }
  //   case 'invoice.payment_failed': {
  //     // Flag the subscription as past_due, notify the user
  //     break
  //   }
  //   case 'customer.subscription.updated': {
  //     // Sync billing interval / cancel_at_period_end changes
  //     break
  //   }
  //   case 'customer.subscription.deleted': {
  //     // Downgrade the user back to tier: 'free'
  //     break
  //   }
  //   default:
  //     // Unhandled event type — acknowledge so Stripe stops retrying.
  //     break
  // }
  //
  // return { status: 200 }

  return { status: 501 } // not implemented — reference stub only
}
