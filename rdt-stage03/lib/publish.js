import { approvalTtlMs, assertControlledMode, measurementConfig, normalizedShop } from './config.js';
import { articleFingerprint } from './fingerprint.js';
import { loadManifest } from './manifest.js';
import { evaluateDraft, evaluatePublished } from './qa.js';
import { gql } from './shopify.js';
import { randomToken } from './security.js';

export const PRODUCT_QUERY = `query ProductForPublication($handle: String!) { productByHandle(handle: $handle) { id handle title status } }`;
export const ARTICLE_QUERY = `query ArticleForPublication($q: String!) { articles(first: 20, query: $q) { nodes { id title handle body summary tags isPublished publishedAt blog { id title handle } image { url altText width height } titleTag: metafield(namespace:"global", key:"title_tag") { id value } descriptionTag: metafield(namespace:"global", key:"description_tag") { id value } } } }`;
export const PUBLISH_ARTICLE = `mutation PublishArticle($id: ID!, $article: ArticleUpdateInput!) { articleUpdate(id: $id, article: $article) { article { id isPublished publishedAt } userErrors { code field message } } }`;

function requiredScopes(scope) {
  const set = new Set(String(scope || '').split(',').map(value=>value.trim()).filter(Boolean));
  for (const required of ['write_content','read_products','write_online_store_pages']) if (!set.has(required)) throw new Error(`Token missing ${required}`);
}

function exactArticle(data, handle) {
  const matches = (data.articles?.nodes || []).filter(article => article.handle === handle);
  if (matches.length !== 1) throw new Error(`Expected one exact article for ${handle}; found ${matches.length}`);
  return matches[0];
}

async function currentProducts(auth, manifest, query, env) {
  const products=[];
  for (const handle of manifest.product_handles) {
    const data=await query(auth,PRODUCT_QUERY,{handle},env);
    const product=data.productByHandle;
    if (!product) throw new Error(`Shopify product not found: ${handle}`);
    if (product.status !== 'ACTIVE') throw new Error(`Product ${handle} is ${product.status}; publication stopped`);
    products.push(product);
  }
  return products;
}

function auditMetafields(approval,status) {
  return [
    {namespace:'resideterra_ops',key:'publication_fingerprint',type:'single_line_text_field',value:approval.fingerprint},
    {namespace:'resideterra_ops',key:'publication_approved_at',type:'date_time',value:approval.approvedAt},
    {namespace:'resideterra_ops',key:'publication_status',type:'single_line_text_field',value:status},
  ];
}

async function updatePublicationState(query,auth,articleId,isPublished,approval,status,env) {
  const data=await query(auth,PUBLISH_ARTICLE,{id:articleId,article:{isPublished,metafields:auditMetafields(approval,status)}},env);
  if (data.articleUpdate.userErrors?.length) throw new Error(`articleUpdate failed: ${JSON.stringify(data.articleUpdate.userErrors)}`);
  return data.articleUpdate.article;
}

export async function prepareApproval(auth,jobId,deps={}) {
  const env=deps.env || process.env;
  const query=deps.gql || gql;
  const qa=deps.evaluateDraft || evaluateDraft;
  assertControlledMode(env);
  measurementConfig(env);
  if (!auth?.shop || !auth?.token) throw new Error('Authenticated Shopify context is required');
  if (auth.shop !== normalizedShop(env)) throw new Error(`Unexpected Shopify shop: ${auth.shop}`);
  requiredScopes(auth.scope);
  const manifest=(deps.loadManifest || loadManifest)(jobId);
  if (manifest.publish_readiness !== 'pilot_approved') throw new Error(`${jobId} is locked for publication`);
  const products=await currentProducts(auth,manifest,query,env);
  const articleData=await query(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`},env);
  const article=exactArticle(articleData,manifest.handle);
  if (article.isPublished) throw new Error('Article is already published; approval preparation stopped');
  const preflight=await qa({article,manifest,fetchImpl:deps.fetchImpl || fetch});
  if (!preflight.pass) throw new Error(`Draft preflight failed: ${JSON.stringify(preflight.checks)}`);
  const now=Date.now();
  const approval={
    purpose:'publish_exact_article',
    job:jobId,
    nonce:randomToken(),
    articleId:article.id,
    handle:article.handle,
    fingerprint:articleFingerprint(article),
    approvedAt:new Date(now).toISOString(),
    exp:now+approvalTtlMs(env),
  };
  return {
    approval,
    article:{id:article.id,title:article.title,handle:article.handle,blog:article.blog,isPublished:article.isPublished,publishedAt:article.publishedAt,image:article.image},
    products,
    preflight,
  };
}

export async function executePublication(auth,approval,deps={}) {
  const env=deps.env || process.env;
  const query=deps.gql || gql;
  const preflightQa=deps.evaluateDraft || evaluateDraft;
  const publishedQa=deps.evaluatePublished || evaluatePublished;
  assertControlledMode(env);
  const measurement=measurementConfig(env);
  if (!approval || approval.purpose !== 'publish_exact_article' || Date.now() > approval.exp) throw new Error('Publishing approval is missing or expired');
  if (!auth?.shop || auth.shop !== normalizedShop(env)) throw new Error('Unexpected Shopify publishing context');
  requiredScopes(auth.scope);
  const manifest=(deps.loadManifest || loadManifest)(approval.job);
  if (manifest.publish_readiness !== 'pilot_approved') throw new Error(`${approval.job} is locked for publication`);
  const products=await currentProducts(auth,manifest,query,env);
  const articleData=await query(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`},env);
  const article=exactArticle(articleData,manifest.handle);
  if (article.id !== approval.articleId || article.handle !== approval.handle) throw new Error('Approved article identity changed');
  if (article.isPublished) throw new Error('Article is already published; replay refused');
  const currentFingerprint=articleFingerprint(article);
  if (currentFingerprint !== approval.fingerprint) throw new Error('Article changed after approval; a new approval is required');
  const preflight=await preflightQa({article,manifest,fetchImpl:deps.fetchImpl || fetch});
  if (!preflight.pass) throw new Error(`Final prepublish QA failed: ${JSON.stringify(preflight.checks)}`);

  let publicationApplied=false;
  try {
    const mutationResult=await updatePublicationState(query,auth,article.id,true,approval,'published_pending_qa',env);
    publicationApplied=mutationResult?.isPublished === true;
    if (!publicationApplied) throw new Error('Shopify did not confirm the article as published');
    const finalData=await query(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`},env);
    const finalArticle=exactArticle(finalData,manifest.handle);
    const qa=await publishedQa({article:finalArticle,manifest,expectedFingerprint:approval.fingerprint,fetchImpl:deps.fetchImpl || fetch});
    if (!qa.pass) {
      await updatePublicationState(query,auth,article.id,false,approval,'rolled_back_after_qa_failure',env);
      const rollbackData=await query(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`},env);
      const rollbackArticle=exactArticle(rollbackData,manifest.handle);
      console.error(JSON.stringify({event:'resideterra_publication_rolled_back',job:approval.job,articleId:article.id,fingerprint:approval.fingerprint,checks:qa.checks,at:new Date().toISOString()}));
      return {pass:false,action:'rolled_back_after_qa_failure',article:{id:rollbackArticle.id,handle:rollbackArticle.handle,isPublished:rollbackArticle.isPublished,publishedAt:rollbackArticle.publishedAt},products,qa,measurement};
    }
    await updatePublicationState(query,auth,article.id,true,approval,'published_qa_passed',env);
    console.log(JSON.stringify({event:'resideterra_publication_succeeded',job:approval.job,articleId:article.id,fingerprint:approval.fingerprint,liveUrl:qa.live?.url,at:new Date().toISOString()}));
    return {pass:true,action:'published_and_verified',job:approval.job,fingerprint:approval.fingerprint,article:{id:finalArticle.id,title:finalArticle.title,handle:finalArticle.handle,blog:finalArticle.blog,isPublished:finalArticle.isPublished,publishedAt:finalArticle.publishedAt},products,qa,measurement};
  } catch (error) {
    if (publicationApplied) {
      try {
        await updatePublicationState(query,auth,article.id,false,approval,'rolled_back_after_exception',env);
      } catch (rollbackError) {
        throw new Error(`${error.message}; CRITICAL: automatic rollback also failed: ${rollbackError.message}`);
      }
    }
    throw error;
  }
}
