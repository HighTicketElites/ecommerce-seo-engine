import test from 'node:test';
import assert from 'node:assert/strict';
import { approvalTtlMs, assertControlledMode, measurementConfig, normalizedShop } from '../lib/config.js';

test('accepts only the Resideterra Shopify identity',()=>{
  assert.equal(normalizedShop({RDT_PUBLISH_SHOP:'resideterra'}),'resideterra.myshopify.com');
  assert.throws(()=>normalizedShop({RDT_PUBLISH_SHOP:'example.myshopify.com'}),/Unexpected Shopify shop/);
});

test('requires controlled mode and a bounded approval lifetime',()=>{
  assert.doesNotThrow(()=>assertControlledMode({RDT_PUBLISH_MODE:'controlled'}));
  assert.throws(()=>assertControlledMode({RDT_PUBLISH_MODE:'automatic'}));
  assert.equal(approvalTtlMs({RDT_PUBLISH_APPROVAL_TTL_SECONDS:'900'}),900000);
  assert.throws(()=>approvalTtlMs({RDT_PUBLISH_APPROVAL_TTL_SECONDS:'3600'}));
});

test('pins the verified measurement properties',()=>{
  const result=measurementConfig({RDT_GA4_MEASUREMENT_ID:'G-98RECGHBCC',RDT_GA4_PROPERTY_ID:'536961964',RDT_GSC_PROPERTY:'sc-domain:resideterra.com'});
  assert.equal(result.ga4PropertyId,'536961964');
  assert.throws(()=>measurementConfig({RDT_GA4_MEASUREMENT_ID:'G-OTHER',RDT_GA4_PROPERTY_ID:'536961964',RDT_GSC_PROPERTY:'https://example.com/'}));
});
