import test from 'node:test';
import assert from 'node:assert/strict';
import { executePublication, prepareApproval } from '../lib/publish.js';
import { loadManifest } from '../lib/manifest.js';

const env={
  RDT_PUBLISH_SHOP:'resideterra.myshopify.com',
  RDT_PUBLISH_MODE:'controlled',
  RDT_PUBLISH_APPROVAL_TTL_SECONDS:'900',
  RDT_GA4_MEASUREMENT_ID:'G-98RECGHBCC',
  RDT_GA4_PROPERTY_ID:'536961964',
  RDT_GSC_PROPERTY:'sc-domain:resideterra.com',
};
const auth={shop:'resideterra.myshopify.com',token:'test-token',scope:'write_content,read_products,write_online_store_pages'};

function fixture(){return {id:'gid://shopify/Article/700000000001',title:'Fire Magic Echelon vs Aurora vs Choice: Which Grill Series Is Right for You?',handle:'fire-magic-echelon-vs-aurora-vs-choice',body:'<h2>Body</h2>',summary:'Summary',tags:['Fire Magic'],isPublished:false,publishedAt:null,blog:{id:'gid://shopify/Blog/1',title:'Outdoor Cooking Guides',handle:'outdoor-cooking-guides'},image:{url:'https://cdn.shopify.com/s/files/1/0892/4862/9058/articles/resideterra-fire-magic-series-comparison-cover-v1.jpg',altText:'Fire Magic Echelon, Aurora, and Choice built-in grills compared in a luxury outdoor kitchen',width:1672,height:941},titleTag:{value:'Fire Magic Echelon vs Aurora vs Choice Grills'},descriptionTag:{value:'Compare Fire Magic Echelon, Aurora, and Choice grills by features, cooking capacity, controls, installation needs, and ideal buyer.'}}}

function eligibleManifest(id){
  const manifest=structuredClone(loadManifest(id));
  manifest.publish_readiness='pilot_approved';
  delete manifest.lock_reason;
  return manifest;
}

function mockShopify(){
  let published=false;
  const article=fixture();
  const calls=[];
  return {
    calls,
    get published(){return published},
    gql:async(_auth,query,variables)=>{
      calls.push({query,variables});
      if(query.includes('productByHandle')) return {productByHandle:{id:`gid://shopify/Product/${variables.handle}`,handle:variables.handle,title:variables.handle,status:'ACTIVE'}};
      if(query.includes('articles(')) return {articles:{nodes:[{...article,isPublished:published,publishedAt:published?'2026-09-06T12:00:00Z':null}]}};
      if(query.includes('articleUpdate')) {published=variables.article.isPublished;return {articleUpdate:{article:{id:article.id,isPublished:published,publishedAt:published?'2026-09-06T12:00:00Z':null},userErrors:[]}}}
      throw new Error('Unexpected query');
    }
  };
}

test('already-published article is refused before any mutation',async()=>{
  let mutationCalls=0;
  const publishedArticle={...fixture(),isPublished:true,publishedAt:'2026-09-05T17:56:18Z'};
  const gql=async(_auth,query,variables)=>{
    if(query.includes('productByHandle')) return {productByHandle:{id:`gid://shopify/Product/${variables.handle}`,handle:variables.handle,title:variables.handle,status:'ACTIVE'}};
    if(query.includes('articles(')) return {articles:{nodes:[publishedArticle]}};
    if(query.includes('articleUpdate')) {mutationCalls++;throw new Error('Mutation must not run');}
    throw new Error('Unexpected query');
  };
  await assert.rejects(()=>prepareApproval(auth,'fire-magic-echelon-vs-aurora-vs-choice',{env,gql,loadManifest:eligibleManifest,evaluateDraft:async()=>({pass:true})}),/already published/);
  assert.equal(mutationCalls,0);
});

test('locked pilot stops before Shopify access',async()=>{
  let calls=0;
  await assert.rejects(()=>prepareApproval(auth,'dimplex-ignitexl-review',{env,gql:async()=>{calls++;},evaluateDraft:async()=>({pass:true})}),/locked for publication/);
  assert.equal(calls,0);
});

test('exact approved fingerprint publishes and passes QA',async()=>{
  const mock=mockShopify();
  const prepared=await prepareApproval(auth,'fire-magic-echelon-vs-aurora-vs-choice',{env,gql:mock.gql,loadManifest:eligibleManifest,evaluateDraft:async()=>({pass:true,checks:{}})});
  const result=await executePublication(auth,prepared.approval,{env,gql:mock.gql,loadManifest:eligibleManifest,evaluateDraft:async()=>({pass:true,checks:{}}),evaluatePublished:async()=>({pass:true,checks:{},live:{url:'https://resideterra.com/blogs/outdoor-cooking-guides/fire-magic-echelon-vs-aurora-vs-choice'}})});
  assert.equal(result.action,'published_and_verified');
  assert.equal(mock.published,true);
});

test('critical live QA failure returns article to draft',async()=>{
  const mock=mockShopify();
  const prepared=await prepareApproval(auth,'fire-magic-echelon-vs-aurora-vs-choice',{env,gql:mock.gql,loadManifest:eligibleManifest,evaluateDraft:async()=>({pass:true,checks:{}})});
  const result=await executePublication(auth,prepared.approval,{env,gql:mock.gql,loadManifest:eligibleManifest,evaluateDraft:async()=>({pass:true,checks:{}}),evaluatePublished:async()=>({pass:false,checks:{live_page:false},live:{status:404}})});
  assert.equal(result.action,'rolled_back_after_qa_failure');
  assert.equal(mock.published,false);
});
