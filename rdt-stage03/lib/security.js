import crypto from 'node:crypto';

export function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function sessionSecret(env = process.env) {
  const secret = env.RDT_PUBLISH_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('RDT_PUBLISH_SESSION_SECRET must contain at least 32 characters');
  return secret;
}

export function signSession(payload, env = process.env) {
  const secret = sessionSecret(env);
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySession(value, env = process.env) {
  const secret = sessionSecret(env);
  const parts = String(value || '').split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error('Publishing session is missing');
  const [body, supplied] = parts;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!safeEqual(supplied, expected)) throw new Error('Publishing session signature is invalid');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.exp || Date.now() > payload.exp) throw new Error('Publishing session expired');
  if (!payload.job || !payload.nonce || !payload.purpose) throw new Error('Publishing session payload is invalid');
  return payload;
}

function encryptionKey(env = process.env) {
  return crypto.createHash('sha256').update(sessionSecret(env)).digest();
}

export function encryptSession(payload, env = process.env) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(env), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv,tag,ciphertext].map(value => value.toString('base64url')).join('.');
}

function decodeCanonicalBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Non-canonical Base64URL');
  const decoded = Buffer.from(value, 'base64url');
  if (decoded.toString('base64url') !== value) throw new Error('Non-canonical Base64URL');
  return decoded;
}

export function decryptSession(value, env = process.env) {
  const parts = String(value || '').split('.');
  if (parts.length !== 3 || parts.some(part => !part)) throw new Error('Approval session is missing');
  const [ivRaw,tagRaw,cipherRaw] = parts;
  try {
    const iv = decodeCanonicalBase64Url(ivRaw);
    const tag = decodeCanonicalBase64Url(tagRaw);
    const ciphertext = decodeCanonicalBase64Url(cipherRaw);
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) throw new Error('Invalid encrypted payload');
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(env), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext),decipher.final()]).toString('utf8');
    const payload = JSON.parse(plaintext);
    if (!payload.exp || Date.now() > payload.exp) throw new Error('Approval expired');
    return payload;
  } catch (error) {
    if (error.message === 'Approval expired') throw error;
    throw new Error('Approval session is invalid');
  }
}

export function randomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function cookieValue(header, key) {
  const match = String(header || '').match(new RegExp(`(?:^|;\\s*)${key}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function validShopifyHmac(url, secret) {
  const params = new URLSearchParams(url.searchParams);
  const supplied = params.get('hmac') || '';
  params.delete('hmac');
  params.delete('signature');
  const message = [...params.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join('&');
  const calculated = crypto.createHmac('sha256', secret).update(message).digest('hex');
  return safeEqual(supplied, calculated);
}
