import crypto from 'node:crypto';
import { exchangeOAuthCode, normalizedShop } from '../../../../lib/shopify.js';
import { runDraftJob } from '../../../../lib/job.js';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;

function esc(v){return String(v??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function cookieValue(header,key){const m=String(header||'').match(new RegExp(`(?:^|;\\s*)${key}=([^;]+)`));return m?decodeURIComponent(m[1]):null;}
function validHmac(url,secret){
  const params=new URLSearchParams(url.searchParams),supplied=params.get('hmac')||'';
  params.delete('hmac');params.delete('signature');
  const message=[...params.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('&');
  const calculated=crypto.createHmac('sha256',secret).update(message).digest('hex');
  if(!supplied||supplied.length!==calculated.length)return false;
  return crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from(calculated));
}
function page(title,payload,ok){
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head><body style="font-family:system-ui;background:#f4f6f8;color:#111827"><main style="max-width:1000px;margin:48px auto;padding:24px"><h1>${esc(title)}</h1><div style="background:white;border:1px solid #dbe2ea;border-radius:12px;padding:22px"><h2 style="color:${ok?'#166534':'#b42318'}">${ok?'DRAFT QA PASS':'STOPPED / QA NEEDS REVIEW'}</h2><pre style="white-space:pre-wrap;overflow-wrap:anywhere;background:#f8fafc;padding:16px;border-radius:8px">${esc(JSON.stringify(payload,null,2))}</pre></div><p><a href="/">Back to Draft Generator</a></p></main></body></html>`;
}
export async function GET(request){
  try{
    const url=new URL(request.url);
    const shop=String(url.searchParams.get('shop')||'').toLowerCase();
    const code=url.searchParams.get('code');
    const state=url.searchParams.get('state');
    const expectedState=cookieValue(request.headers.get('cookie'),'rdt_oauth_state');
    const secret=process.env.RDT_SHOPIFY_CLIENT_SECRET;
    if(!code||!shop||!state) throw new Error('OAuth callback is missing required parameters');
    if(shop!==normalizedShop()) throw new Error(`Unexpected Shopify shop: ${shop}`);
    if(!expectedState||state!==expectedState) throw new Error('OAuth state validation failed');
    if(!secret||!validHmac(url,secret)) throw new Error('OAuth HMAC validation failed');
    const auth=await exchangeOAuthCode({shop,code});
    const result=await runDraftJob(auth);
    const headers=new Headers({'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'});
    headers.append('Set-Cookie','rdt_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    return new Response(page('Fire Bowl vs Fire & Water Bowl Draft Job',result,result.pass),{status:result.pass?200:409,headers});
  }catch(error){
    const payload={error:error?.message||String(error),safety:'No publication action was executed.'};
    return new Response(page('Fire Bowl vs Fire & Water Bowl Draft Job - Stopped Safely',payload,false),{status:500,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'}});
  }
}
