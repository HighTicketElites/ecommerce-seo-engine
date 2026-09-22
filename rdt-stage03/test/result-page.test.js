import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPublicationErrorPage, renderPublicationResult } from '../lib/result-page.js';

function publishedResult() {
  return {
    pass: true,
    action: 'published_and_verified',
    job: 'modern-flames-landscape-vs-orion',
    fingerprint: 'ce248a53bcbf85052b7ced58653a5fc9398aee34c6d74876fbef78da6b3b1e4e',
    article: {
      id: 'gid://shopify/Article/617616277826',
      title: 'Modern Flames Landscape Pro Multi vs Orion Multi',
      handle: 'modern-flames-landscape-pro-multi-vs-orion-multi',
      blog: {title: 'Electric Fireplaces'},
      isPublished: true,
      publishedAt: '2026-09-14T21:39:42Z',
    },
    products: [{title: 'Landscape Pro Multi', status: 'ACTIVE'}, {title: 'Orion Multi', status: 'ACTIVE'}],
    qa: {
      checks: {publication_state: true, live_page: true},
      metrics: {words: 2657, h2: 13, faq: 10, images: 4},
      cover: {url: 'https://cdn.shopify.com/cover.jpg'},
      live: {url: 'https://resideterra.com/blogs/electric-fireplaces/modern-flames-landscape-pro-multi-vs-orion-multi'},
    },
  };
}

test('successful publication renders a readable operator page instead of JSON', () => {
  const html = renderPublicationResult(publishedResult(), 'resideterra.myshopify.com');
  assert.match(html, /Published and verified/);
  assert.match(html, /View live article/);
  assert.match(html, /2657/);
  assert.match(html, /Automatic rollback was armed and was not needed/);
  assert.match(html, /admin\.shopify\.com\/store\/resideterra\/content\/articles\/617616277826/);
  assert.doesNotMatch(html, /^\s*\{/);
});

test('failed live QA renders the rollback state without a live-article action', () => {
  const result = publishedResult();
  result.pass = false;
  result.action = 'rolled_back_after_qa_failure';
  result.article.isPublished = false;
  result.article.publishedAt = null;
  result.qa.checks.live_page = false;
  const html = renderPublicationResult(result, 'resideterra.myshopify.com');
  assert.match(html, /Publication rolled back/);
  assert.match(html, /Unpublished after rollback/);
  assert.doesNotMatch(html, /View live article/);
});

test('publishing error output escapes dynamic content', () => {
  const html = renderPublicationErrorPage(new Error('<script>alert("x")</script>'));
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /Confirm its current Shopify state before retrying/);
});
