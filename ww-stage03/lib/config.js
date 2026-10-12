const REQUIRED = [
  'SHOPIFY_SHOP',
  'SHOPIFY_CLIENT_ID',
  'SHOPIFY_CLIENT_SECRET',
  'WW_PUBLISH_API_VERSION',
  'APP_URL',
  'WW_PUBLISH_SESSION_SECRET',
  'WW_PUBLISH_MODE',
  'WW_PUBLISH_APPROVAL_TTL_SECONDS',
];

export function normalizedShop(env = process.env) {
  const raw = String(env.SHOPIFY_SHOP || '').trim().toLowerCase();
  if (!raw) throw new Error('SHOPIFY_SHOP is missing');
  const shop = raw.endsWith('.myshopify.com') ? raw : `${raw}.myshopify.com`;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) throw new Error(`Unexpected Shopify shop format: ${shop}`);
  return shop;
}
export function apiVersion(env = process.env) {
  const value = String(env.WW_PUBLISH_API_VERSION || '').trim();
  if (!/^20\d{2}-(01|04|07|10)$/.test(value)) throw new Error('WW_PUBLISH_API_VERSION must be an explicit stable Shopify API version');
  return value;
}
export function appUrl(env = process.env) {
  const url = new URL(String(env.APP_URL || ''));
  if (url.protocol !== 'https:') throw new Error('APP_URL must use HTTPS');
  return url.origin;
}
export function assertControlledMode(env = process.env) {
  if (env.WW_PUBLISH_MODE !== 'controlled') throw new Error('WW_PUBLISH_MODE must equal controlled');
}
export function approvalTtlMs(env = process.env) {
  const seconds = Number(env.WW_PUBLISH_APPROVAL_TTL_SECONDS);
  if (!Number.isInteger(seconds) || seconds < 300 || seconds > 1800) throw new Error('WW_PUBLISH_APPROVAL_TTL_SECONDS must be between 300 and 1800');
  return seconds * 1000;
}
export function measurementConfig() { return {ga4MeasurementId:null,ga4PropertyId:null,gscProperty:null}; }
export function publicConfigStatus(env = process.env) { return Object.fromEntries(REQUIRED.map(key => [key, Boolean(env[key])])); }
