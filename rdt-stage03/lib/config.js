const REQUIRED = [
  'RDT_PUBLISH_SHOP',
  'RDT_PUBLISH_CLIENT_ID',
  'RDT_PUBLISH_CLIENT_SECRET',
  'RDT_PUBLISH_API_VERSION',
  'RDT_PUBLISH_APP_URL',
  'RDT_PUBLISH_SESSION_SECRET',
  'RDT_PUBLISH_MODE',
  'RDT_PUBLISH_APPROVAL_TTL_SECONDS',
  'RDT_GA4_MEASUREMENT_ID',
  'RDT_GA4_PROPERTY_ID',
  'RDT_GSC_PROPERTY',
];

export function normalizedShop(env = process.env) {
  const raw = String(env.RDT_PUBLISH_SHOP || '').trim().toLowerCase();
  if (!raw) throw new Error('RDT_PUBLISH_SHOP is missing');
  const shop = raw.endsWith('.myshopify.com') ? raw : `${raw}.myshopify.com`;
  if (shop !== 'resideterra.myshopify.com') throw new Error(`Unexpected Shopify shop: ${shop}`);
  return shop;
}

export function apiVersion(env = process.env) {
  const value = String(env.RDT_PUBLISH_API_VERSION || '').trim();
  if (!/^20\d{2}-(01|04|07|10)$/.test(value)) throw new Error('RDT_PUBLISH_API_VERSION must be an explicit stable Shopify API version');
  return value;
}

export function appUrl(env = process.env) {
  const url = new URL(String(env.RDT_PUBLISH_APP_URL || ''));
  if (url.protocol !== 'https:') throw new Error('RDT_PUBLISH_APP_URL must use HTTPS');
  return url.origin;
}

export function assertControlledMode(env = process.env) {
  if (env.RDT_PUBLISH_MODE !== 'controlled') throw new Error('RDT_PUBLISH_MODE must equal controlled');
}

export function approvalTtlMs(env = process.env) {
  const seconds = Number(env.RDT_PUBLISH_APPROVAL_TTL_SECONDS);
  if (!Number.isInteger(seconds) || seconds < 300 || seconds > 1800) throw new Error('RDT_PUBLISH_APPROVAL_TTL_SECONDS must be between 300 and 1800');
  return seconds * 1000;
}

export function measurementConfig(env = process.env) {
  const ga4MeasurementId = String(env.RDT_GA4_MEASUREMENT_ID || '').trim();
  const ga4PropertyId = String(env.RDT_GA4_PROPERTY_ID || '').trim();
  const gscProperty = String(env.RDT_GSC_PROPERTY || '').trim();
  if (!/^G-[A-Z0-9]+$/.test(ga4MeasurementId)) throw new Error('RDT_GA4_MEASUREMENT_ID is invalid');
  if (!/^\d+$/.test(ga4PropertyId)) throw new Error('RDT_GA4_PROPERTY_ID is invalid');
  if (gscProperty !== 'sc-domain:resideterra.com') throw new Error('RDT_GSC_PROPERTY must use the canonical Resideterra domain property');
  return {ga4MeasurementId,ga4PropertyId,gscProperty};
}

export function publicConfigStatus(env = process.env) {
  return Object.fromEntries(REQUIRED.map(key => [key, Boolean(env[key])]));
}
