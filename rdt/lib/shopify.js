const API_VERSION = '2026-07';
const EXPECTED_SHOP = 'resideterra.myshopify.com';

export function normalizedShop() {
  const raw = (process.env.RDT_SHOPIFY_SHOP || '').trim().toLowerCase();
  if (!raw) throw new Error('RDT_SHOPIFY_SHOP is missing');
  const shop = raw.endsWith('.myshopify.com') ? raw : `${raw}.myshopify.com`;
  if (shop !== EXPECTED_SHOP) throw new Error(`Unexpected configured Shopify shop: ${shop}`);
  return shop;
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
