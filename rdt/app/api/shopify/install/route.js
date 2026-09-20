import crypto from 'node:crypto';
import { normalizedShop } from '../../../../lib/shopify.js';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const SCOPES=['write_content','read_products'].join(',');

export async function GET(request){
  try{
    const shop=normalizedShop();
    const clientId=process.env.RDT_SHOPIFY_CLIENT_ID;
    if(!clientId) throw new Error('RDT_SHOPIFY_CLIENT_ID missing');
    const origin=new URL(request.url).origin;
    const redirectUri=`${origin}/api/shopify/callback`;
    const state=crypto.randomBytes(24).toString('hex');
    const authUrl=new URL(`https://${shop}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id',clientId);
    authUrl.searchParams.set('scope',SCOPES);
    authUrl.searchParams.set('redirect_uri',redirectUri);
    authUrl.searchParams.set('state',state);
    const headers=new Headers({Location:authUrl.toString(),'Cache-Control':'no-store'});
    headers.append('Set-Cookie',`rdt_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
    return new Response(null,{status:307,headers});
  }catch(error){
    return Response.json({error:error.message,safety:'No Shopify action was executed.'},{status:500});
  }
}
