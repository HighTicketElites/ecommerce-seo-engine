import crypto from 'node:crypto';
function safeEqual(a,b){
  const left=Buffer.from(String(a||'')); const right=Buffer.from(String(b||''));
  return left.length===right.length && crypto.timingSafeEqual(left,right);
}
export function signSession(payload,env=process.env){
  const secret=env.RDT_SESSION_SECRET;
  if(!secret||secret.length<32) throw new Error('RDT_SESSION_SECRET must contain at least 32 characters');
  const body=Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig=crypto.createHmac('sha256',secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}
export function verifySession(value,env=process.env){
  if(!env.RDT_SESSION_SECRET||env.RDT_SESSION_SECRET.length<32) throw new Error('RDT_SESSION_SECRET must contain at least 32 characters');
  const [body,supplied]=String(value||'').split('.');
  if(!body||!supplied) throw new Error('Run session is missing');
  const expected=crypto.createHmac('sha256',env.RDT_SESSION_SECRET).update(body).digest('base64url');
  if(!safeEqual(supplied,expected)) throw new Error('Run session signature is invalid');
  const payload=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
  if(!payload.exp||Date.now()>payload.exp) throw new Error('Run session expired');
  if(!payload.job||!payload.nonce) throw new Error('Run session payload is invalid');
  return payload;
}
export function randomToken(bytes=24){return crypto.randomBytes(bytes).toString('hex');}
export function cookieValue(header,key){
  const match=String(header||'').match(new RegExp(`(?:^|;\\s*)${key}=([^;]+)`));
  return match?decodeURIComponent(match[1]):null;
}
export function validShopifyHmac(url,secret){
  const params=new URLSearchParams(url.searchParams), supplied=params.get('hmac')||'';
  params.delete('hmac'); params.delete('signature');
  const message=[...params.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('&');
  const calculated=crypto.createHmac('sha256',secret).update(message).digest('hex');
  return safeEqual(supplied,calculated);
}
