const API_VERSION = '2026-07';
const EXPECTED_SHOP = 'resideterra.myshopify.com';
const EXPECTED_RDT_CLIENT_ID = 'd906cc861efd02a18d7368be97d129c2';

export function normalizedShop() {
  const raw = (process.env.RDT_SHOPIFY_SHOP || '').trim().toLowerCase();
  if (!raw) throw new Error('RDT_SHOPIFY_SHOP is missing');
  const shop = raw.endsWith('.myshopify.com') ? raw : `${raw}.myshopify.com`;
  if (shop !== EXPECTED_SHOP) throw new Error(`Unexpected configured Shopify shop: ${shop}`);
  return shop;
}

export async function serverAuth(env=process.env) {
  const shop = normalizedShop();
  const clientId = env.RDT_SHOPIFY_CLIENT_ID;
  const clientSecret = env.RDT_SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('ResideTerra Shopify client credentials are missing');
  if (clientId !== EXPECTED_RDT_CLIENT_ID) throw new Error('RDT_SHOPIFY_CLIENT_ID does not match the approved ResideTerra Shopify app');
  const body = new URLSearchParams({grant_type:'client_credentials',client_id:clientId,client_secret:clientSecret});
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json'}, body, cache:'no-store'
  });
  const raw = await res.text(); let json = {};
  try { json = JSON.parse(raw); } catch {}
  if(!res.ok || !json.access_token) {
    const detail = json.error_description || json.error || `HTTP ${res.status}`;
    throw new Error(`Shopify server authorization failed: ${detail}`);
  }
  return {shop,token:json.access_token,scope:json.scope||'',expires_in:json.expires_in||null,token_type:json.token_type||'access_token'};
}

export async function exchangeOAuthCode({ shop, code }) {
  const clientId = process.env.RDT_SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.RDT_SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('ResideTerra Shopify OAuth credentials are missing');
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({client_id:clientId,client_secret:clientSecret,code}), cache:'no-store'
  });
  const text=await res.text(); let json;
  try { json=JSON.parse(text); } catch { throw new Error(`OAuth token exchange returned non-JSON (${res.status})`); }
  if(!res.ok || !json.access_token) throw new Error(`OAuth token exchange failed (${res.status})`);
  return {shop,token:json.access_token,scope:json.scope||''};
}
export async function gql(auth, query, variables={}) {
  const res=await fetch(`https://${auth.shop}/admin/api/${API_VERSION}/graphql.json`,{
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json','X-Shopify-Access-Token':auth.token},
    body:JSON.stringify({query,variables}),cache:'no-store'
  });
  const text=await res.text(); let json;
  try { json=JSON.parse(text); } catch { throw new Error(`Shopify GraphQL returned non-JSON (${res.status})`); }
  if(!res.ok) throw new Error(`Shopify GraphQL HTTP ${res.status}`);
  if(json.errors?.length) throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}
