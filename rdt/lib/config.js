export function normalizedShop(env=process.env){
  const raw=String(env.RDT_SHOPIFY_SHOP||'').trim().toLowerCase();
  if(!raw) throw new Error('RDT_SHOPIFY_SHOP is missing');
  const shop=raw.endsWith('.myshopify.com')?raw:`${raw}.myshopify.com`;
  if(shop!=='resideterra.myshopify.com') throw new Error(`Unexpected Shopify shop: ${shop}`);
  return shop;
}
export function appUrl(env=process.env){
  const raw=String(env.RDT_APP_URL||'').trim();
  if(!raw) throw new Error('RDT_APP_URL is missing');
  const url=new URL(raw);
  if(url.protocol!=='https:') throw new Error('RDT_APP_URL must use HTTPS');
  return url.origin;
}
