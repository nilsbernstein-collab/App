/**
 * REST endpoint structure for the Pro "API-Zugang" feature — future
 * bank-account and Shopify data connections. These endpoints don't do
 * anything yet; they document the intended surface so the frontend's data
 * layer (src/data/repositories/) can be extended to call them without a
 * rewrite once a real integration exists.
 */

// --- Shopify ------------------------------------------------------------

interface ShopifyConnectRequestBody {
  shopDomain: string // e.g. "my-store.myshopify.com"
  /** OAuth authorization code returned by Shopify's app install flow. */
  code: string
}

export async function connectShopifyHandler(_body: ShopifyConnectRequestBody): Promise<{ connected: boolean }> {
  // 1. Exchange `code` for a permanent access token via Shopify's OAuth token endpoint.
  // 2. Store the token encrypted, associated with the user's account.
  // 3. Register a webhook subscription for `orders/paid` to auto-import income transactions.
  throw new Error('Not implemented — reference stub only')
}

export async function listShopifyOrdersHandler(_userId: string): Promise<unknown[]> {
  // Fetch recent orders via Shopify Admin API using the stored access token,
  // map each to a NewTransaction (type: 'income', categoryId: the user's
  // "Umsatz" category, sourceId: the linked income source) and hand off to
  // transactionRepository.create() on the client, or persist server-side if
  // a backend datastore is introduced.
  return []
}

// --- Bank (e.g. via a provider like GoCardless / Plaid / FinAPI) --------

interface BankConnectRequestBody {
  institutionId: string
  /** Callback / redirect URL after the user authorizes access at their bank. */
  redirectUrl: string
}

export async function initiateBankConnectionHandler(
  _body: BankConnectRequestBody,
): Promise<{ authorizationUrl: string }> {
  // Kick off the chosen open-banking provider's consent flow and return the
  // URL to redirect the user to.
  throw new Error('Not implemented — reference stub only')
}

export async function listBankTransactionsHandler(_userId: string): Promise<unknown[]> {
  // Pull transactions for the connected account(s) and map them the same way
  // as listShopifyOrdersHandler above.
  return []
}
