import { appUrl, normalizedShop } from '../../../../lib/config.js';
import { cookieValue, randomToken, verifySession } from '../../../../lib/security.js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const SCOPES=['write_content','read_products'].join(',');
export async function GET(request){
  try{
    const session=verifySession(cookieValue(request.headers.get('cookie'),'rdt_run_session'));
    if(session.job!=='fire-bowl-vs-fire-water-bowl') throw new Error('Unexpected run session job');
    const shop=normalizedShop();
    const clientId=process.env.RDT_SHOPIFY_CLIENT_ID;
    if(!clientId) throw new Error('RDT_SHOPIFY_CLIENT_ID is missing');
    const state=randomToken();
    const redirectUri=`${appUrl()}/api/shopify/callback`;
    const authUrl=new URL(`https://${shop}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id',clientId);
    authUrl.searchParams.set('scope',SCOPES);
    authUrl.searchParams.set('redirect_uri',redirectUri);
    authUrl.searchParams.set('state',state);
    const headers=new Headers({Location:authUrl.toString(),'Cache-Control':'no-store'});
    headers.append('Set-Cookie',`rdt_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
    return new Response(null,{status:307,headers});
  }catch(error){
    return Response.json({error:error.message,safety:'No Shopify action was executed.'},{status:401,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }
}
