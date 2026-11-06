import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import { mock, test } from 'node:test';

// Next's bundler resolves this extensionless import in production.
registerHooks({resolve(specifier,context,nextResolve) {
  return nextResolve(specifier==='next/server'?'next/server.js':specifier,context);
}});

const canonical='https://wattwheelz-shopify-content-ops.vercel.app';
const alias='https://wattwheelz-shopify-content-ops-info-19821198.vercel.app';
const job='rattan-lm-ultra-vs-mooncool-pop-folding-ebike';
const shop='test-wattwheelz.myshopify.com';
Object.assign(process.env,{
  APP_URL:canonical,SHOPIFY_SHOP:shop,SHOPIFY_CLIENT_ID:'test-client',
  SHOPIFY_CLIENT_SECRET:'local-test-secret',WW_PUBLISH_SESSION_SECRET:'local-test-session-secret-at-least-32-characters',
  WW_PUBLISH_APPROVAL_TTL_SECONDS:'900',WW_PUBLISH_MODE:'controlled'
});

let exchanges=0,preparations=0;
mock.module('../lib/shopify.js',{namedExports:{exchangeOAuthCode:async()=>{
  exchanges++;return {shop,token:'local-test-token',scope:'write_content,read_products'};
}}});
mock.module('../lib/publish.js',{namedExports:{prepareApproval:async(auth,selectedJob)=>{
  preparations++;
  assert.equal(auth.shop,shop);assert.equal(selectedJob,job);
  return {approval:{exp:Date.now()+900000,nonce:'test-nonce',fingerprint:'test-fingerprint'},article:{title:'Test draft',handle:job,isPublished:false},products:[]};
}}});

const {POST:start}=await import('../app/api/shopify/start/route.js');
const {GET:callback}=await import('../app/api/shopify/callback/route.js');
const {renderPublicationErrorPage}=await import('../lib/result-page.js');

function startRequest(origin,selectedJob=job) {
  return new Request(origin+'/api/shopify/start',{method:'POST',body:new URLSearchParams({job:selectedJob})});
}
function callbackRequest({cookie=true,state='test-state',callbackShop=shop,validHmac=true}={}) {
  const u=new URL(canonical+'/api/shopify/callback');
  for(const [key,value] of Object.entries({shop:callbackShop,code:'test-code',state,timestamp:'1793987000'}))u.searchParams.set(key,value);
  const message=[...u.searchParams.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('&');
  u.searchParams.set('hmac',validHmac?crypto.createHmac('sha256',process.env.SHOPIFY_CLIENT_SECRET).update(message).digest('hex'):'bad');
  return new Request(u,{headers:cookie?{cookie:`ww_pub_oauth_state=test-state; ww_pub_oauth_job=${job}`}:{}});
}

test('every rendered dashboard posts directly to the configured canonical host',()=>{
  const page=fs.readFileSync(new URL('../app/page.js',import.meta.url),'utf8');
  assert.ok(page.includes('action={`${appUrl()}/api/shopify/start`}'));
  assert.ok(!page.includes('action="/api/shopify/start"'));
});

test('alias POST preserves the exact job and returns to canonical review without OAuth or cookies',async()=>{
  const response=await start(startRequest(alias));
  assert.equal(response.status,303);
  assert.equal(response.headers.get('location'),canonical+'/?job='+job);
  assert.equal(response.headers.get('set-cookie'),null);
  assert.equal(exchanges,0);assert.equal(preparations,0);
});

test('canonical POST sets host-only Secure HttpOnly Lax cookies matching the OAuth callback origin',async()=>{
  const response=await start(startRequest(canonical));
  assert.equal(response.status,303);
  const location=new URL(response.headers.get('location'));
  assert.equal(location.origin,'https://'+shop);
  assert.equal(location.searchParams.get('redirect_uri'),canonical+'/api/shopify/callback');
  const cookies=response.headers.getSetCookie();
  assert.equal(cookies.length,2);
  assert.ok(cookies.some(c=>c.startsWith('ww_pub_oauth_state='+location.searchParams.get('state'))));
  assert.ok(cookies.some(c=>c.startsWith('ww_pub_oauth_job='+job)));
  for(const c of cookies){assert.match(c,/Secure/i);assert.match(c,/HttpOnly/i);assert.match(c,/SameSite=lax/i);assert.doesNotMatch(c,/Domain=/i);}
});

test('locked or unknown jobs remain blocked before canonical redirects',async()=>{
  for(const selectedJob of ['best-ebikes-for-hills-2026','unknown-job']){
    const response=await start(startRequest(alias,selectedJob));
    assert.equal(response.status,500);assert.equal(response.headers.get('location'),null);
    assert.equal(response.headers.get('set-cookie'),null);
  }
});

test('missing or expired browser context blocks token exchange and does not imply a rollback',async()=>{
  const before=exchanges;
  const response=await callback(callbackRequest({cookie:false}));
  const html=await response.text();
  assert.equal(response.status,500);assert.equal(exchanges,before);
  assert.match(html,/Shopify authorization was not completed/);
  assert.match(html,/No publish or rollback request was made/);
  assert.doesNotMatch(html,/article was returned to draft/);
});

test('wrong shop, state mismatch and invalid HMAC remain fail-closed',async()=>{
  const before=exchanges;
  for(const options of [{callbackShop:'wrong-shop.myshopify.com'},{state:'other-tab-state'},{validHmac:false}]){
    const response=await callback(callbackRequest(options));
    assert.equal(response.status,500);
    assert.equal(response.headers.getSetCookie().length,2);
  }
  assert.equal(exchanges,before);
});

test('valid authenticated callback prepares final approval only and clears OAuth context',async()=>{
  const before=exchanges;
  const response=await callback(callbackRequest());
  assert.equal(response.status,200);assert.equal(exchanges,before+1);assert.equal(preparations,1);
  const html=await response.text();
  assert.match(html,/Final approval required/);assert.match(html,/No publication has occurred/);
  assert.match(html,/Draft \/ unpublished/);
  assert.ok(response.headers.getSetCookie().some(c=>c.startsWith('ww_pub_approval_session=')));
  assert.ok(response.headers.getSetCookie().filter(c=>/ww_pub_oauth_(state|job)=/.test(c)).every(c=>/Max-Age=0/.test(c)));
});

test('reopened callback without cleared cookies cannot replay authorization',async()=>{
  const before=exchanges;
  assert.equal((await callback(callbackRequest({cookie:false}))).status,500);
  assert.equal(exchanges,before);
});

test('execution errors keep the existing unknown-state warning rather than assuming no mutation',()=>{
  assert.match(renderPublicationErrorPage(new Error('execution failed')),/Confirm its current Shopify state before retrying/);
  assert.doesNotMatch(renderPublicationErrorPage(new Error('execution failed')),/No publish or rollback request was made/);
});
