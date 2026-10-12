import { NextResponse } from 'next/server';
import { appUrl, normalizedShop } from '../../../../lib/config.js';
import { loadManifest } from '../../../../lib/manifest.js';
import { randomToken } from '../../../../lib/security.js';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const SCOPES=['read_content','write_content','read_products','read_files'].join(',');

export async function POST(request) {
  try {
    const form=await request.formData();
    const job=String(form.get('job')||'');
    const manifest=loadManifest(job);
    if(manifest.publish_readiness!=='pilot_approved') throw new Error(`${job} is locked for publication`);

    const shop=normalizedShop();
    const clientId=process.env.SHOPIFY_CLIENT_ID;
    if(!clientId) throw new Error('SHOPIFY_CLIENT_ID missing');

    const state=randomToken();
    const callback=`${appUrl()}/api/shopify/callback`;
    const authUrl=new URL(`https://${shop}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id',clientId);
    authUrl.searchParams.set('scope',SCOPES);
    authUrl.searchParams.set('redirect_uri',callback);
    authUrl.searchParams.set('state',state);

    const response=NextResponse.redirect(authUrl,{status:303});
    response.cookies.set('ww_pub_oauth_state',state,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:600});
    response.cookies.set('ww_pub_oauth_job',job,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:600});
    return response;
  } catch(error) {
    return NextResponse.json({error:error?.message||String(error),safety:'No Shopify publication action was executed.'},{
      status:500,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}
    });
  }
}
