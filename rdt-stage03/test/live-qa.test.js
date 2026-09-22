import test from 'node:test';
import assert from 'node:assert/strict';
import { articleFingerprint } from '../lib/fingerprint.js';
import { evaluatePublished } from '../lib/qa.js';

function fixture() {
  const manifest = {
    handle:'pilot',
    blog_handle:'electric-fireplaces',
    seo_title:'Exact SEO Title',
    meta_description:'Exact storefront meta description used for publication verification.',
    required_internal_links:[],
    cover_image:{url:'https://cdn.shopify.com/files/editorial-cover.png',alt:'Cover'},
    qa:{minimum_words:0,minimum_h2:0,minimum_faq:0,minimum_images:0},
  };
  const article = {
    id:'gid://shopify/Article/1',title:'Article Heading',handle:'pilot',body:'<h2>Sources &amp; Verification</h2>',summary:'Summary',tags:[],
    isPublished:true,publishedAt:'2026-09-15T00:00:00Z',blog:{handle:'electric-fireplaces'},
    image:{url:'https://cdn.shopify.com/files/editorial-cover.png',altText:'Cover',width:1672,height:941},
    titleTag:{value:manifest.seo_title},descriptionTag:{value:manifest.meta_description},
  };
  return {article,manifest};
}

function fetchFor(html) {
  return async url => ({ok:true,status:200,url:String(url),text:async()=>html});
}

test('published QA verifies rendered title, meta description, and editorial cover', async () => {
  const {article,manifest}=fixture();
  const html=`<html><head><title>${manifest.seo_title} | Resideterra</title><meta content="${manifest.meta_description}" name="description"></head><body><h1>${article.title}</h1><img src="/cdn/${manifest.cover_image.url.split('/').pop()}"></body></html>`;
  const result=await evaluatePublished({article,manifest,expectedFingerprint:articleFingerprint(article),fetchImpl:fetchFor(html)});
  assert.equal(result.pass,true);
  assert.equal(result.checks.live_seo_title,true);
  assert.equal(result.checks.live_meta_description,true);
  assert.equal(result.checks.live_editorial_cover,true);
});

test('published QA fails when an SEO app replaces the meta description with article content', async () => {
  const {article,manifest}=fixture();
  const html=`<html><head><title>${article.title} | Resideterra</title><meta name="description" content="${article.body.repeat(20)}"></head><body><h1>${article.title}</h1><img src="/cdn/editorial-cover.png"></body></html>`;
  const result=await evaluatePublished({article,manifest,expectedFingerprint:articleFingerprint(article),fetchImpl:fetchFor(html)});
  assert.equal(result.pass,false);
  assert.equal(result.checks.live_seo_title,false);
  assert.equal(result.checks.live_meta_description,false);
  assert.equal(result.checks.live_editorial_cover,true);
});
