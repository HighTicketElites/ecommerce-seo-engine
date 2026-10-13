import { NextResponse } from 'next/server';
import { loadManifest } from '../../../../lib/manifest.js';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(request){
  try{
    const url=new URL(request.url);
    const job=String(url.searchParams.get('job')||'');
    const manifest=loadManifest(job);
    return NextResponse.json({
      pass:false,
      auth_required:true,
      job,
      title:manifest.title,
      message:'WattWheelz reconciliation requires Shopify OAuth. Use the controlled publishing dashboard. During the normal Stage 03 publish flow, live QA runs immediately after publication and automatically returns the article to draft if a critical check fails.',
      safety:'No Shopify publication action was executed.'
    },{status:428,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }catch(error){
    return NextResponse.json({pass:false,error:error?.message||String(error)},{status:500,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }
}
