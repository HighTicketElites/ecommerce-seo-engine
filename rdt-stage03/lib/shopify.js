import { apiVersion, normalizedShop } from './config.js';

export async function exchangeOAuthCode({ shop, code }, env = process.env) {
  const clientId = env.RDT_PUBLISH_CLIENT_ID;
  const clientSecret = env.RDT_PUBLISH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Resideterra publishing OAuth credentials are missing');
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    cache: 'no-store',
  });
  const raw = await res.text();
  let json;
  try { json = JSON.parse(raw); } catch { throw new Error(`OAuth token exchange returned non-JSON (${res.status})`); }
  if (!res.ok || !json.access_token) throw new Error(`OAuth token exchange failed (${res.status})`);
  return { shop, token: json.access_token, scope: json.scope || '' };
}

export async function serverAuth(env = process.env) {
  const shop = normalizedShop(env);
  const clientId = env.RDT_PUBLISH_CLIENT_ID;
  const clientSecret = env.RDT_PUBLISH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Resideterra publishing client credentials are missing');

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
    cache: 'no-store',
  });

  const raw = await res.text();
  let json = {};
  try { json = JSON.parse(raw); } catch {}

  if (!res.ok || !json.access_token) {
    const detail = json.error_description || json.error || `HTTP ${res.status}`;
    throw new Error(`Shopify server authorization failed: ${detail}`);
  }

  return {
    shop,
    token: json.access_token,
    scope: json.scope || '',
    expires_in: json.expires_in || null,
    token_type: json.token_type || 'access_token',
  };
}

export async function gql(auth, query, variables = {}, env = process.env) {
  const res = await fetch(`https://${auth.shop}/admin/api/${apiVersion(env)}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Shopify-Access-Token': auth.token },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const raw = await res.text();
  let json;
  try { json = JSON.parse(raw); } catch { throw new Error(`Shopify GraphQL returned non-JSON (${res.status})`); }
  if (!res.ok) throw new Error(`Shopify GraphQL HTTP ${res.status}`);
  if (json.errors?.length) throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}
