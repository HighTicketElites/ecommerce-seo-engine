const API_VERSION = '2026-07';

export function normalizedShop() {
  const raw = (process.env.SHOPIFY_SHOP || '').trim().toLowerCase();
  if (!raw) throw new Error('SHOPIFY_SHOP is missing');
  return raw.endsWith('.myshopify.com') ? raw : `${raw}.myshopify.com`;
}

export async function exchangeOAuthCode({ shop, code }) {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Shopify OAuth credentials are missing');

  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    cache: 'no-store',
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error(`OAuth token exchange returned non-JSON (${res.status}): ${text.slice(0,180)}`); }

  if (!res.ok || !json.access_token) {
    throw new Error(`OAuth token exchange failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return { shop, token: json.access_token, scope: json.scope || '' };
}

export async function gql(auth, query, variables = {}) {
  const res = await fetch(`https://${auth.shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Shopify-Access-Token': auth.token,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error(`Shopify GraphQL returned non-JSON (${res.status}): ${text.slice(0,180)}`); }
  if (!res.ok) throw new Error(`Shopify GraphQL HTTP ${res.status}: ${JSON.stringify(json)}`);
  if (json.errors?.length) throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}
