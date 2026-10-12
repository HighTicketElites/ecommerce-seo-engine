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
      message:'WattWheelz requires Shopify OAuth. Use the controlled publishing page to authorize Shopify; Stage 03 runs the full read-only draft preflight before it can issue a final publishing approval.',
      safety:'No publication action was executed.'
    },{status:428,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }catch(error){
    return NextResponse.json({pass:false,error:error?.message||String(error)},{status:500,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }
}
