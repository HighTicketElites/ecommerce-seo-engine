import { NextResponse } from 'next/server';
import { loadManifest } from '../../../../lib/manifest.js';
import { randomToken, signSession } from '../../../../lib/security.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const form = await request.formData();
    const job = String(form.get('job') || '');
    const manifest=loadManifest(job);
    if (manifest.publish_readiness !== 'pilot_approved') throw new Error(`${job} is locked for publication`);
    const session = signSession({purpose:'prepare_approval',job,nonce:randomToken(),exp:Date.now()+10*60*1000});
    const response = NextResponse.redirect(new URL('/api/shopify/install', request.url), 303);
    response.cookies.set('rdt_pub_run_session',session,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:600});
    return response;
  } catch (error) {
    return NextResponse.json({error:error.message,safety:'No Shopify publication action was executed.'},{status:401,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }
}
