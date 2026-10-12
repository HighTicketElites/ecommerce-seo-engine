import { NextResponse } from 'next/server';
import { approvalTtlMs, normalizedShop } from '../../../../lib/config.js';
import { loadManifest } from '../../../../lib/manifest.js';
import { prepareApproval } from '../../../../lib/publish.js';
import { renderApprovalPage, renderPublicationErrorPage } from '../../../../lib/result-page.js';
import { cookieValue, encryptSession, safeEqual, validShopifyHmac } from '../../../../lib/security.js';
import { exchangeOAuthCode } from '../../../../lib/shopify.js';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;

export async function GET(request) {
  let response;
  try {
    const url=new URL(request.url);
    const shop=String(url.searchParams.get('shop')||'').toLowerCase();
    const code=url.searchParams.get('code');
    const state=url.searchParams.get('state');
    const cookies=request.headers.get('cookie');
    const expectedState=cookieValue(cookies,'ww_pub_oauth_state');
    const job=cookieValue(cookies,'ww_pub_oauth_job');
    const secret=process.env.SHOPIFY_CLIENT_SECRET;

    if(!code||!shop||!state||!job) throw new Error('OAuth callback is missing required publishing context');
    if(shop!==normalizedShop()) throw new Error(`Unexpected Shopify shop: ${shop}`);
    if(!expectedState||!safeEqual(state,expectedState)) throw new Error('OAuth state validation failed');
    if(!secret||!validShopifyHmac(url,secret)) throw new Error('OAuth HMAC validation failed');

    const manifest=loadManifest(job);
    if(manifest.publish_readiness!=='pilot_approved') throw new Error(`${job} is locked for publication`);

    const auth=await exchangeOAuthCode({shop,code});
    const result=await prepareApproval(auth,job);
    const encrypted=encryptSession({
      purpose:'execute_publication',
      auth,
      approval:result.approval,
      exp:result.approval.exp,
    });

    response=new NextResponse(renderApprovalPage(result),{
      status:200,
      headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'}
    });
    response.cookies.set('ww_pub_approval_session',encrypted,{
      httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:Math.floor(approvalTtlMs()/1000)
    });
  } catch(error) {
    response=new NextResponse(renderPublicationErrorPage(error),{
      status:500,
      headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'}
    });
  }
  response.cookies.set('ww_pub_oauth_state','',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});
  response.cookies.set('ww_pub_oauth_job','',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});
  return response;
}
