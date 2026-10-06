import { NextResponse } from 'next/server';
import { loadManifest } from '../../../../lib/manifest.js';
import { ARTICLE_QUERY } from '../../../../lib/publish.js';
import { evaluateDraft } from '../../../../lib/qa.js';
import { gql, serverAuth } from '../../../../lib/shopify.js';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;

export async function GET(request){
  try{
    const url=new URL(request.url);
    const job=String(url.searchParams.get('job')||'');
    const manifest=loadManifest(job);
    const auth=await serverAuth();
    const data=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
    const article=(data.articles?.nodes||[]).find(node=>node.handle===manifest.handle);
    if(!article) throw new Error(`Article not found: ${manifest.handle}`);
    if(article.isPublished) throw new Error('Article is already published; draft preflight diagnostic stopped');
    const qa=await evaluateDraft({article,manifest});
    return NextResponse.json({pass:qa.pass,job,checks:qa.checks,metrics:qa.metrics,required:qa.required,links:qa.links,cover:qa.cover},{status:200,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }catch(error){
    return NextResponse.json({pass:false,error:error?.message||String(error)},{status:500,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }
}
