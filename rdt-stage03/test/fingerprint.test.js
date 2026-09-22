import test from 'node:test';
import assert from 'node:assert/strict';
import { articleFingerprint } from '../lib/fingerprint.js';

function article(){return {id:'gid://shopify/Article/1',title:'Title',handle:'handle',body:'<h2>Body</h2>',summary:'Summary',tags:['B','A'],isPublished:false,publishedAt:null,blog:{id:'gid://shopify/Blog/1',handle:'electric-fireplaces'},image:{url:'https://cdn.shopify.com/cover.png?v=1',altText:'Cover'},titleTag:{value:'SEO title'},descriptionTag:{value:'SEO description'}}}

test('fingerprint ignores publication state and unstable CDN query strings',()=>{
  const before=article();
  const after={...before,isPublished:true,publishedAt:'2026-09-06T00:00:00Z',image:{...before.image,url:'https://cdn.shopify.com/cover.png?v=2'}};
  assert.equal(articleFingerprint(before),articleFingerprint(after));
});

test('fingerprint detects protected content changes',()=>{
  const before=article();
  assert.notEqual(articleFingerprint(before),articleFingerprint({...before,body:'<h2>Changed</h2>'}));
});
