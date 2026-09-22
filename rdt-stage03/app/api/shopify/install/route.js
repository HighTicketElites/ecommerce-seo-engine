import { NextResponse } from 'next/server';
import { appUrl, normalizedShop } from '../../../../lib/config.js';
import { cookieValue, randomToken, verifySession } from '../../../../lib/security.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const SCOPES = ['write_content','read_products','write_online_store_pages'].join(',');

export async function GET(request) {
  try {
    const session = verifySession(cookieValue(request.headers.get('cookie'),'rdt_pub_run_session'));
    if (session.purpose !== 'prepare_approval') throw new Error('Unexpected publishing session purpose');
    const shop = normalizedShop();
    const clientId = process.env.RDT_PUBLISH_CLIENT_ID;
    if (!clientId) throw new Error('RDT_PUBLISH_CLIENT_ID is missing');
    const state = randomToken();
    const redirectUri = `${appUrl()}/api/shopify/callback`;
    const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id',clientId);
    authUrl.searchParams.set('scope',SCOPES);
    authUrl.searchParams.set('redirect_uri',redirectUri);
    authUrl.searchParams.set('state',state);
    const response = NextResponse.redirect(authUrl,307);
    response.cookies.set('rdt_pub_oauth_state',state,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:600});
    response.cookies.set('rdt_pub_job_id',session.job,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:600});
    return response;
  } catch (error) {
    return NextResponse.json({error:error.message,safety:'No Shopify publication action was executed.'},{status:401,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }
}
