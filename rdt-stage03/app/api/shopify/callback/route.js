import { NextResponse } from 'next/server';
import { approvalTtlMs, normalizedShop } from '../../../../lib/config.js';
import { prepareApproval } from '../../../../lib/publish.js';
import { cookieValue, encryptSession, validShopifyHmac, verifySession } from '../../../../lib/security.js';
import { exchangeOAuthCode } from '../../../../lib/shopify.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
}

function approvalHtml(result) {
  const expires=new Date(result.approval.exp).toISOString();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Approve Resideterra publication</title></head><body style="font-family:Arial,sans-serif;max-width:900px;margin:48px auto;padding:24px;line-height:1.55;color:#111827"><h1>Final publishing approval</h1><p><strong>No publication has occurred.</strong> Review the exact locked record below. This approval expires at ${escapeHtml(expires)}.</p><section style="border:1px solid #d1d5db;border-radius:10px;padding:20px;margin:22px 0"><h2>${escapeHtml(result.article.title)}</h2><p>Handle: <code>${escapeHtml(result.article.handle)}</code></p><p>Blog: ${escapeHtml(result.article.blog?.title)}</p><p>Published: ${escapeHtml(result.article.isPublished)}</p><p>Products revalidated: ${escapeHtml(result.products.length)}</p><p>Content fingerprint:</p><code style="word-break:break-all">${escapeHtml(result.approval.fingerprint)}</code></section><form method="post" action="/api/publish/execute"><input type="hidden" name="approval_nonce" value="${escapeHtml(result.approval.nonce)}"><button type="submit" style="padding:14px 20px;background:#991b1b;color:#fff;border:0;border-radius:7px;font-weight:700">Publish this exact article and run live QA</button></form><p style="font-size:14px;color:#4b5563">If content, products, links, metadata, images, or article state changes before this click, publication will be refused. Critical post-publication failure triggers automatic rollback to draft.</p></body></html>`;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const shop = String(url.searchParams.get('shop') || '').toLowerCase();
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const expectedState = cookieValue(request.headers.get('cookie'),'rdt_pub_oauth_state');
    const job = cookieValue(request.headers.get('cookie'),'rdt_pub_job_id');
    const runSession = verifySession(cookieValue(request.headers.get('cookie'),'rdt_pub_run_session'));
    const secret = process.env.RDT_PUBLISH_CLIENT_SECRET;
    if (!code || !shop || !state || !job) throw new Error('OAuth callback is missing required parameters');
    if (runSession.purpose !== 'prepare_approval' || runSession.job !== job) throw new Error('Publishing session does not match OAuth job');
    if (shop !== normalizedShop()) throw new Error(`Unexpected Shopify shop: ${shop}`);
    if (!expectedState || state !== expectedState) throw new Error('OAuth state validation failed');
    if (!secret || !validShopifyHmac(url,secret)) throw new Error('OAuth HMAC validation failed');
    const auth = await exchangeOAuthCode({shop,code});
    const result = await prepareApproval(auth,job);
    const encrypted=encryptSession({purpose:'execute_publication',auth,approval:result.approval,exp:result.approval.exp});
    const response = new NextResponse(approvalHtml(result),{status:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'}});
    response.cookies.set('rdt_pub_approval_session',encrypted,{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:Math.floor(approvalTtlMs()/1000)});
    for (const key of ['rdt_pub_oauth_state','rdt_pub_job_id','rdt_pub_run_session']) response.cookies.set(key,'',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});
    return response;
  } catch (error) {
    return NextResponse.json({error:error.message,safety:'No Shopify publication action was executed.'},{status:500,headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
  }
}
