import { NextResponse } from 'next/server';
import { articleFingerprint } from '../../../../lib/fingerprint.js';
import { loadManifest } from '../../../../lib/manifest.js';
import { ARTICLE_QUERY } from '../../../../lib/publish.js';
import { evaluatePublished } from '../../../../lib/qa.js';
import { gql, serverAuth } from '../../../../lib/shopify.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const job = String(url.searchParams.get('job') || '');
    const manifest = loadManifest(job);
    const auth = await serverAuth();
    const data = await gql(auth, ARTICLE_QUERY, {q:`handle:${manifest.handle}`});
    const article = (data.articles?.nodes || []).find(node => node.handle === manifest.handle);
    if (!article) throw new Error(`Article not found: ${manifest.handle}`);
    if (!article.isPublished) throw new Error('Article is not published; reconciliation stopped');
    const fingerprint = articleFingerprint(article);
    const qa = await evaluatePublished({article, manifest, expectedFingerprint:fingerprint});
    return NextResponse.json({
      pass:qa.pass,
      job,
      article:{
        id:article.id,
        title:article.title,
        handle:article.handle,
        isPublished:article.isPublished,
        publishedAt:article.publishedAt,
        updatedAt:article.updatedAt,
        blog:article.blog,
      },
      fingerprint,
      checks:qa.checks,
      metrics:qa.metrics,
      live:qa.live,
      required:qa.required,
      links:qa.links,
      cover:qa.cover,
    },{status:200,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  } catch (error) {
    return NextResponse.json({pass:false,error:error?.message||String(error)},{status:500,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }
}
