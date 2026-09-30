import { gql } from './shopify.js';
import manifest from '../data/hunting-ebikes-2026-manifest.js';
import body01 from '../data/hunting-ebikes-2026-body-01.js';
import body02 from '../data/hunting-ebikes-2026-body-02.js';
import body03 from '../data/hunting-ebikes-2026-body-03.js';
import body04 from '../data/hunting-ebikes-2026-body-04.js';
import body05 from '../data/hunting-ebikes-2026-body-05.js';
import body06 from '../data/hunting-ebikes-2026-body-06.js';
import body07 from '../data/hunting-ebikes-2026-body-07.js';

const sourceBody=[body01,body02,body03,body04,body05,body06,body07].join('');
const PRODUCT_HANDLES=[
  'eunorau-specter-s-4-0-hunter-x9-electric-bike',
  'eunorau-defender-s-2-0-hunter-x6-awd-electric-bike',
  'fat-hd-2-0',
  'fat-hs',
  'fat-awd-3-0'
];

const PRODUCT_QUERY=`
query ProductForArticle($handle:String!){
 productByHandle(handle:$handle){
  id handle title status vendor
  priceRangeV2{minVariantPrice{amount currencyCode}}
  featuredMedia{preview{image{url altText width height}}}
  media(first:12){nodes{... on MediaImage{image{url altText width height}}}}
 }
}`;
const BLOGS_QUERY=`query{blogs(first:100){nodes{id title handle}}}`;
const ARTICLE_QUERY=`
query ArticleByHandle($q:String!){
 articles(first:20,query:$q){
  nodes{id title handle body summary tags isPublished publishedAt blog{id title handle} image{url altText}
   titleTag:metafield(namespace:"global",key:"title_tag"){id value}
   descriptionTag:metafield(namespace:"global",key:"description_tag"){id value}}
 }
}`;
const CREATE=`mutation CreateArticle($article:ArticleCreateInput!){articleCreate(article:$article){article{id title handle isPublished publishedAt blog{id handle title} image{url altText}} userErrors{code field message}}}`;
const UPDATE=`mutation UpdateArticle($id:ID!,$article:ArticleUpdateInput!){articleUpdate(id:$id,article:$article){article{id title handle isPublished publishedAt blog{id handle title} image{url altText}} userErrors{code field message}}}`;

function htmlEscape(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function imageFor(product){const f=product?.featuredMedia?.preview?.image;if(f?.url)return f;for(const n of product?.media?.nodes||[]){if(n?.image?.url)return n.image;}return null;}
function imgFigure(image,alt,caption){return `<figure><img src="${htmlEscape(image.url)}" alt="${htmlEscape(alt)}" loading="lazy" style="max-width:100%;height:auto"/><figcaption>${htmlEscape(caption)}</figcaption></figure>`;}
function buildBody(products){
 let body=sourceBody;
 const byHandle=Object.fromEntries(products.map(p=>[p.handle,p]));
 const price=(h)=>byHandle[h]?.priceRangeV2?.minVariantPrice?.amount ? '$'+Number(byHandle[h].priceRangeV2.minVariantPrice.amount).toLocaleString('en-US',{maximumFractionDigits:2}) : 'Check current price';
 body=body.replaceAll('{{PRICE_X9}}',price(PRODUCT_HANDLES[0]))
          .replaceAll('{{PRICE_X6}}',price(PRODUCT_HANDLES[1]))
          .replaceAll('{{PRICE_X7}}',price(PRODUCT_HANDLES[2]))
          .replaceAll('{{PRICE_X8}}',price(PRODUCT_HANDLES[3]))
          .replaceAll('{{PRICE_AWD}}',price(PRODUCT_HANDLES[4]));
 const reps=[
   ['<!-- IMAGE X9 -->',PRODUCT_HANDLES[0],'EUNORAU Hunter X9 hunting e-bike','Current EUNORAU SPECTER S 4.0 / Hunter X9.'],
   ['<!-- IMAGE X9 DETAIL -->',PRODUCT_HANDLES[0],'EUNORAU Hunter X9 electric hunting bike detail','Hunter X9 product detail.'],
   ['<!-- IMAGE X6 -->',PRODUCT_HANDLES[1],'EUNORAU Hunter X6 AWD hunting e-bike','Current Defender S 2.0 / Hunter X6.'],
   ['<!-- IMAGE X7 -->',PRODUCT_HANDLES[2],'EUNORAU Hunter X7 hunting e-bike','Current FAT-HD 2.0 / Hunter X7.'],
   ['<!-- IMAGE X8 -->',PRODUCT_HANDLES[3],'EUNORAU Hunter X8 hunting e-bike','Current FAT-HS / Hunter X8.'],
   ['<!-- IMAGE AWD -->',PRODUCT_HANDLES[4],'EUNORAU FAT-AWD 3.0 hunting e-bike','Current FAT-AWD 3.0.']
 ];
 for(const [marker,h,alt,cap] of reps){
   const p=byHandle[h]; let img=imageFor(p);
   if(marker.includes('DETAIL') && p?.media?.nodes?.[1]?.image?.url) img=p.media.nodes[1].image;
   if(!img) throw new Error('Missing authentic Shopify image for '+h);
   body=body.replace(marker,imgFigure(img,alt,cap));
 }
 return body;
}
function wordCount(html){return html.replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').trim().split(/\s+/).filter(Boolean).length;}
function countTag(html,tag){return(html.match(new RegExp(`<${tag}\\b`,'gi'))||[]).length;}
function internalLinks(html){return[...html.matchAll(/href=["'](https:\/\/wattwheelz\.com\/[^"']+)["']/gi)].map(m=>m[1]);}
async function linkStatus(url){try{const res=await fetch(url,{method:'GET',redirect:'follow',cache:'no-store',headers:{'User-Agent':'WattWheelz-SEO-Draft-QA/1.0'}});return{url,status:res.status,ok:res.ok};}catch(e){return{url,status:0,ok:false,error:e.message};}}
function metafields(existing){
 const out=[];
 if(existing?.titleTag?.id)out.push({id:existing.titleTag.id,value:manifest.seo_title});else out.push({namespace:'global',key:'title_tag',value:manifest.seo_title,type:'single_line_text_field'});
 if(existing?.descriptionTag?.id)out.push({id:existing.descriptionTag.id,value:manifest.meta_description});else out.push({namespace:'global',key:'description_tag',value:manifest.meta_description,type:'single_line_text_field'});
 return out;
}

export async function runDraftJob(auth){
 if(!auth?.shop||!auth?.token)throw new Error('Authenticated Shopify OAuth context is required');
 const scopeSet=new Set((auth.scope||'').split(',').map(s=>s.trim()).filter(Boolean));
 if(!scopeSet.has('write_content'))throw new Error(`Token missing write_content. Granted: ${auth.scope}`);
 if(!scopeSet.has('read_products'))throw new Error(`Token missing read_products. Granted: ${auth.scope}`);

 const products=[];
 for(const handle of PRODUCT_HANDLES){
   const d=await gql(auth,PRODUCT_QUERY,{handle}); const p=d.productByHandle;
   if(!p)throw new Error('Shopify product not found: '+handle);
   if(p.status!=='ACTIVE')throw new Error(`Product ${handle} status is ${p.status}; draft generation stopped`);
   products.push(p);
 }

 const blogData=await gql(auth,BLOGS_QUERY);
 const blog=(blogData.blogs?.nodes||[]).find(b=>b.id===manifest.blog_id);
 if(!blog)throw new Error('Canonical E-Bike Buying Guides blog not found');
 if(blog.handle!==manifest.blog_handle)throw new Error(`Blog handle mismatch: expected ${manifest.blog_handle}, got ${blog.handle}`);

 const existingData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
 const matches=(existingData.articles?.nodes||[]).filter(a=>a.handle===manifest.handle);
 if(matches.length>1)throw new Error('Duplicate article handle detected: '+manifest.handle);
 const existing=matches[0]||null;
 if(existing?.isPublished)throw new Error('Existing hunting guide is published; draft generator refuses to modify a live article');

 const body=buildBody(products);
 const featured=imageFor(products[0]);
 const articleInput={blogId:blog.id,title:manifest.title,handle:manifest.handle,body,summary:manifest.excerpt,tags:manifest.tags,author:{name:'WattWheelz'},isPublished:false,image:{url:featured.url,altText:'Best electric bikes for hunting 2026'},metafields:metafields(existing)};
 let action;
 if(existing){const d=await gql(auth,UPDATE,{id:existing.id,article:articleInput});if(d.articleUpdate.userErrors?.length)throw new Error(`articleUpdate failed: ${JSON.stringify(d.articleUpdate.userErrors)}`);action='updated_existing_draft';}
 else{const d=await gql(auth,CREATE,{article:articleInput});if(d.articleCreate.userErrors?.length)throw new Error(`articleCreate failed: ${JSON.stringify(d.articleCreate.userErrors)}`);action='created_new_draft';}

 const finalData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
 const finalMatches=(finalData.articles?.nodes||[]).filter(a=>a.handle===manifest.handle);
 if(finalMatches.length!==1)throw new Error(`Post-write exact-handle QA expected 1 article; found ${finalMatches.length}`);
 const finalArticle=finalMatches[0];
 const urls=[...new Set(internalLinks(finalArticle.body||''))]; const links=[];
 for(const url of urls)links.push(await linkStatus(url));
 const required=manifest.required_internal_links.map(url=>({url,present:(finalArticle.body||'').includes(url)}));
 const wc=wordCount(finalArticle.body||'');
 const qa={
   draft_only:finalArticle.isPublished===false&&finalArticle.publishedAt==null,
   correct_blog:finalArticle.blog?.id===manifest.blog_id&&finalArticle.blog?.handle===manifest.blog_handle,
   correct_handle:finalArticle.handle===manifest.handle,
   word_count:wc,
   word_depth_ok:wc>=manifest.qa.minimum_words,
   h2_count:countTag(finalArticle.body||'','h2'),
   h2_ok:countTag(finalArticle.body||'','h2')>=manifest.qa.minimum_h2,
   faq_count:countTag(finalArticle.body||'','h3'),
   faq_ok:countTag(finalArticle.body||'','h3')>=manifest.qa.minimum_faq,
   no_h1:countTag(finalArticle.body||'','h1')===0,
   inline_images:countTag(finalArticle.body||'','img'),
   images_ok:countTag(finalArticle.body||'','img')>=manifest.qa.minimum_images,
   featured_image:Boolean(finalArticle.image?.url),
   featured_alt:Boolean(finalArticle.image?.altText),
   sources:/Sources\s*(?:&|&amp;|and)\s*Verification/i.test(finalArticle.body||''),
   seo_title:finalArticle.titleTag?.value===manifest.seo_title,
   meta_description:finalArticle.descriptionTag?.value===manifest.meta_description,
   required_links:required.every(x=>x.present),
   internal_links:links.every(x=>x.ok),
   product_links_ok:linkTypeCount(finalArticle.body||'','products')>=1,\n   collection_links_ok:linkTypeCount(finalArticle.body||'','collections')>=1,\n   related_blog_links_ok:linkTypeCount(finalArticle.body||'','blogs')>=1,\n   public_land_rules:/Bureau of Land Management|BLM/i.test(finalArticle.body||'')&&/Forest Service/i.test(finalArticle.body||'')
 };
 const pass=Object.entries(qa).filter(([k])=>!['word_count','h2_count','faq_count','inline_images'].includes(k)).every(([,v])=>v===true);
 return{pass,action,article:{id:finalArticle.id,title:finalArticle.title,handle:finalArticle.handle,blog:finalArticle.blog,isPublished:finalArticle.isPublished,publishedAt:finalArticle.publishedAt,image:finalArticle.image},products:products.map(p=>({id:p.id,title:p.title,handle:p.handle,status:p.status,currentPrice:p.priceRangeV2?.minVariantPrice})),qa,required,links,scope:auth.scope,handoff:pass?'Hunting e-bike draft passed engine QA. Review in Shopify, then publish when approved.':'Do not publish until draft QA passes.'};
}
