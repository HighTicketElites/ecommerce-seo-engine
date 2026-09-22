import test from 'node:test';
import assert from 'node:assert/strict';
import { decryptSession, encryptSession, signSession, verifySession } from '../lib/security.js';

const env={RDT_PUBLISH_SESSION_SECRET:'12345678901234567890123456789012'};

test('signed preparation session round trips and rejects tampering',()=>{
  const token=signSession({purpose:'prepare_approval',job:'test-job',nonce:'abc',exp:Date.now()+10000},env);
  assert.equal(verifySession(token,env).job,'test-job');
  assert.throws(()=>verifySession(`${token}x`,env));
});

test('encrypted approval session hides data and rejects tampering',()=>{
  const payload={purpose:'execute_publication',job:'test-job',nonce:'secret-nonce',exp:Date.now()+10000};
  const token=encryptSession(payload,env);
  assert.equal(token.includes('secret-nonce'),false);
  assert.equal(decryptSession(token,env).nonce,'secret-nonce');
  const parts=token.split('.');
  const first=parts[2][0];
  parts[2]=`${first === 'A' ? 'B' : 'A'}${parts[2].slice(1)}`;
  assert.throws(()=>decryptSession(parts.join('.'),env),/invalid/);
  assert.throws(()=>decryptSession(`${token}.extra`,env),/missing/);
});
