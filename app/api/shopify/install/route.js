import crypto from 'node:crypto';
import { normalizedShop } from '../../../../lib/shopify.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCOPES = [
  'read_content','write_content','read_products','read_files','write_files',
  'read_online_store_navigation','write_online_store_navigation'
].join(',');

const OAUTH_ORIGIN = 'https://wattwheelz-seo-draft-generator-info-19821198.vercel.app';
const OAUTH_CALLBACK = `${OAUTH_ORIGIN}/api/shopify/callback`;

export async function GET(request) {
  const requestUrl = new URL(request.url);

  // Shopify only accepts the callback URL already registered on the app.
  // Force all Vercel aliases onto that same hostname BEFORE setting the
  // OAuth state cookie, otherwise the cookie would be scoped to the wrong host.
  if (requestUrl.origin !== OAUTH_ORIGIN) {
    return new Response(null, {
      status: 307,
      headers: {
        Location: `${OAUTH_ORIGIN}/api/shopify/install`,
        'Cache-Control': 'no-store'
      }
    });
  }

  const shop = normalizedShop();
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  if (!clientId) return new Response('SHOPIFY_CLIENT_ID missing', { status: 500 });

  const state = crypto.randomBytes(24).toString('hex');
  const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('redirect_uri', OAUTH_CALLBACK);
  authUrl.searchParams.set('state', state);

  const headers = new Headers({ Location: authUrl.toString(), 'Cache-Control': 'no-store' });
  headers.append('Set-Cookie', `ww_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return new Response(null, { status: 307, headers });
}
