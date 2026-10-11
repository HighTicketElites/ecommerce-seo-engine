import { gql } from './shopify.js';
import manifest from '../data/manifest.js';
import body01 from '../data/body-01.js';
import body02 from '../data/body-02.js';
import body03 from '../data/body-03.js';
import body04 from '../data/body-04.js';
import body05 from '../data/body-05.js';
import body06 from '../data/body-06.js';
import body07 from '../data/body-07.js';

const sourceBody=[body01,body02,body03,body04,body05,body06,body07].join('');
const PARTNER_CONCIERGE_URL='https://resideterra.com/pages/pro-partner-program';
const B2B_GRANDFATHERED_JOBS=new Set(['120v-vs-240v-electric-fireplaces']);

const PRODUCT_QUERY=`query ProductForArticle($handle:String!){
  productByHandle(handle:$handle){
    id handle title status vendor
    priceRangeV2{minVariantPrice{amount currencyCode}}
    featuredMedia{preview{image{url altText width height}}}
    media(first:20){nodes{... on MediaImage{image{url altText width height}}}}
  }
}`;
const BLOGS_QUERY=`query { blogs(first:100){nodes{id title handle}} }`;
const ARTICLE_QUERY=`query ArticleByHandle($q:String!){
  articles(first:20,query:$q){nodes{
    id title handle body summary tags isPublished publishedAt
    blog{id title handle}
    image{url altText width height}
    titleTag:metafield(namespace:"global",key:"title_tag"){id value}
    descriptionTag:metafield(namespace:"global",key:"description_tag"){id value}
  }}
}`;
const CREATE=`mutation CreateArticle($article:ArticleCreateInput!){
  articleCreate(article:$article){article{id title handle isPublished publishedAt blog{id handle title} image{url altText width height}} userErrors{code field message}}
}`;
const UPDATE=`mutation UpdateArticle($id:ID!,$article:ArticleUpdateInput!){
  articleUpdate(id:$id,article:$article){article{id title handle isPublished publishedAt blog{id handle title} image{url altText width height}} userErrors{code field message}}
}`;

function esc(v){return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function priceText(price){
  if(!price?.amount) return '';
  const code=price.currencyCode||'USD';
  try{return new Intl.NumberFormat('en-US',{style:'currency',currency:code,maximumFractionDigits:2}).format(Number(price.amount));}
  catch{return '$'+Number(price.amount).toLocaleString('en-US');}
}
function imagesFor(product){
  const out=[]; const featured=product?.featuredMedia?.preview?.image;
  if(featured?.url) out.push(featured);
  for(const node of product?.media?.nodes||[]){const img=node?.image;if(img?.url&&!out.some(x=>x.url===img.url))out.push(img);}
  return out;
}
function figure(image,alt,caption){
  if(!image?.url) throw new Error('Authentic Shopify product image missing');
  return `<figure><img src="${esc(image.url)}" alt="${esc(alt)}" loading="lazy" style="max-width:100%;height:auto"/><figcaption>${esc(caption)}</figcaption></figure>`;
}
function validateAudienceStrategy(){
  const a=manifest.audience;
  if(!a) throw new Error('Manifest audience strategy is required for every RDT article');
  if(!['consumer','hybrid','professional_commercial'].includes(a.primary)) throw new Error('Manifest audience.primary must be consumer, hybrid, or professional_commercial');
  if(typeof a.b2b_applicable!=='boolean') throw new Error('Manifest audience.b2b_applicable must be explicitly true or false');
  if(a.b2b_applicable){
    if(!Array.isArray(a.b2b_personas)||!a.b2b_personas.length) throw new Error('B2B-applicable article requires at least one professional persona');
    if(!String(a.professional_context||'').trim()) throw new Error('B2B-applicable article requires professional_context');
    if(!String(a.procurement_support||'').trim()) throw new Error('B2B-applicable article requires procurement_support');
    if(a.conversion_target!==PARTNER_CONCIERGE_URL) throw new Error('B2B conversion target must be the live Partner Concierge page');
    if(!B2B_GRANDFATHERED_JOBS.has(manifest.id)&&a.inject_professional_section!==true) throw new Error('B2B-applicable article must inject the professional/commercial section');
  }else if(String(a.b2b_reason||'').trim().length<20){
    throw new Error('Articles marked not B2B-applicable require a substantive b2b_reason');
  }
  return true;
}
function professionalBlock(){
  const a=manifest.audience;
  if(!a?.b2b_applicable||a.inject_professional_section!==true) return '';
  const personas=a.b2b_personas.join(', ');
  return `<h2>Professional and Commercial Project Considerations</h2><p><strong>For professional buyers:</strong> ${esc(a.professional_context)} This is especially relevant for ${esc(personas)}.</p><p>${esc(a.procurement_support)} For project-scale selection, specification support, and coordinated purchasing, use the <a href="${PARTNER_CONCIERGE_URL}">ResideTerra Partner Concierge</a>.</p>`;
}
function buildBody(products){
  validateAudienceStrategy();
  let body=sourceBody;
  for(const [handle,product] of products){
    body=body.replaceAll(`{{title:${handle}}}`,esc(product.title));
    body=body.replaceAll(`{{price:${handle}}}`,esc(priceText(product.priceRangeV2?.minVariantPrice)));
  }
  for(const slot of manifest.image_slots){
    const product=products.get(slot.handle);
    const imgs=imagesFor(product);
    if(!imgs.length) throw new Error(`No authentic Shopify product images found for ${slot.handle}`);
    body=body.replace(`<!-- RDT_IMAGE:${slot.id} -->`,figure(imgs[0],slot.alt,slot.caption));
  }
  const pro=professionalBlock();
  if(pro){
    const sources=body.search(/<h2>Sources\s*(?:&|&amp;|and)\s*Verification<\/h2>/i);
    body=sources>=0?body.slice(0,sources)+pro+body.slice(sources):body+pro;
  }
  return body;
}
function wordCount(html){return html.replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').trim().split(/\s+/).filter(Boolean).length;}
function countTag(html,tag){return (html.match(new RegExp(`<${tag}\\b`,'gi'))||[]).length;}
function metafields(existing){
  return [
    existing?.titleTag?.id?{id:existing.titleTag.id,value:manifest.seo_title}:{namespace:'global',key:'title_tag',value:manifest.seo_title,type:'single_line_text_field'},
    existing?.descriptionTag?.id?{id:existing.descriptionTag.id,value:manifest.meta_description}:{namespace:'global',key:'description_tag',value:manifest.meta_description,type:'single_line_text_field'}
  ];
}
function coverUrl(){
  const base=process.env.RDT_APP_URL||'https://resideterra-seo-draft-generator.vercel.app';
  return new URL('/api/cover',base).toString();
}
async function coverLoads(url){
  try{const r=await fetch(url,{cache:'no-store',redirect:'follow'});return r.ok&&String(r.headers.get('content-type')||'').startsWith('image/');}
  catch{return false;}
}
function qaResult(article,body){
  const words=wordCount(body),h2=countTag(body,'h2'),faq=countTag(body,'h3'),images=countTag(body,'img');
  const checks={
    publication_state:article.isPublished===false&&article.publishedAt==null,
    correct_blog:article.blog?.handle===manifest.blog_handle,
    correct_handle:article.handle===manifest.handle,
    no_h1:countTag(body,'h1')===0,
    minimum_words:words>=manifest.qa.minimum_words,
    minimum_h2:h2>=manifest.qa.minimum_h2,
    minimum_faq:faq>=manifest.qa.minimum_faq,
    minimum_images:images>=manifest.qa.minimum_images,
    editorial_cover:Boolean(article.image?.url),
    editorial_cover_alt:article.image?.altText===manifest.cover.alt,
    editorial_cover_ratio:article.image?.width&&article.image?.height?Math.abs(article.image.width/article.image.height-16/9)<0.12:true,
    sources_section:/Sources\s*(?:&|&amp;|and)\s*Verification/i.test(body),
    unresolved_placeholders:!/{{[^}]+}}/.test(body)&&!/RDT_IMAGE:/.test(body),
    seo_title:article.titleTag?.value===manifest.seo_title,
    meta_description:article.descriptionTag?.value===manifest.meta_description,
    required_links:manifest.required_internal_links.every(url=>body.includes(url)),
    internal_links:(body.match(/https:\/\/resideterra\.com\//g)||[]).length>=4,
    b2b_strategy:(()=>{try{return validateAudienceStrategy();}catch{return false;}})(),
    b2b_conversion_path:!manifest.audience?.b2b_applicable||B2B_GRANDFATHERED_JOBS.has(manifest.id)||body.includes(manifest.audience.conversion_target)
  };
  return {checks,metrics:{words,h2,faq,images}};
}

export async function runDraftJob(auth){
  if(!auth?.shop||!auth?.token) throw new Error('Authenticated Shopify OAuth context is required');
  const scopes=new Set(String(auth.scope||'').split(',').map(x=>x.trim()).filter(Boolean));
  for(const required of ['write_content','read_products']) if(!scopes.has(required)) throw new Error(`Token missing ${required}. Granted: ${auth.scope}`);

  const products=new Map();
  for(const handle of manifest.product_handles){
    const data=await gql(auth,PRODUCT_QUERY,{handle});
    const product=data.productByHandle;
    if(!product) throw new Error(`Shopify product not found: ${handle}`);
    if(product.status!=='ACTIVE') throw new Error(`Product ${handle} is ${product.status}; draft generation stopped`);
    products.set(handle,product);
  }

  const blogData=await gql(auth,BLOGS_QUERY);
  const blog=(blogData.blogs?.nodes||[]).find(x=>x.handle===manifest.blog_handle);
  if(!blog) throw new Error(`Canonical blog not found: ${manifest.blog_handle}`);

  const existingData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
  const matches=(existingData.articles?.nodes||[]).filter(x=>x.handle===manifest.handle);
  if(matches.length>1) throw new Error(`Duplicate article handle detected: ${manifest.handle}`);
  const existing=matches[0]||null;
  if(existing?.isPublished) throw new Error('Existing article is published; the draft generator refuses to modify live content');

  const body=buildBody(products);
  const imageUrl=coverUrl();
  if(!(await coverLoads(imageUrl))) throw new Error('Editorial cover endpoint did not return a loadable image');

  const articleInput={
    blogId:blog.id,title:manifest.title,handle:manifest.handle,body,
    summary:manifest.excerpt,tags:manifest.tags,author:{name:'ResideTerra'},
    isPublished:false,image:{url:imageUrl,altText:manifest.cover.alt},
    metafields:metafields(existing)
  };

  let action;
  if(existing){
    const data=await gql(auth,UPDATE,{id:existing.id,article:articleInput});
    if(data.articleUpdate.userErrors?.length) throw new Error(`articleUpdate failed: ${JSON.stringify(data.articleUpdate.userErrors)}`);
    action='updated_existing_draft';
  }else{
    const data=await gql(auth,CREATE,{article:articleInput});
    if(data.articleCreate.userErrors?.length) throw new Error(`articleCreate failed: ${JSON.stringify(data.articleCreate.userErrors)}`);
    action='created_new_draft';
  }

  const finalData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
  const finalMatches=(finalData.articles?.nodes||[]).filter(x=>x.handle===manifest.handle);
  if(finalMatches.length!==1) throw new Error(`Post-write exact-handle QA expected one article; found ${finalMatches.length}`);
  const article=finalMatches[0];
  const qa=qaResult(article,article.body||'');
  qa.checks.editorial_cover_loads=await coverLoads(article.image?.url||'');
  const pass=Object.values(qa.checks).every(Boolean);

  return {
    pass,action,job:manifest.id,
    article:{id:article.id,title:article.title,handle:article.handle,blog:article.blog,isPublished:article.isPublished,publishedAt:article.publishedAt,image:article.image},
    products:[...products.values()].map(p=>({id:p.id,handle:p.handle,title:p.title,status:p.status,price:p.priceRangeV2?.minVariantPrice})),
    qa,
    handoff:pass?'Ready for the separate controlled publishing plane.':'Stop. Draft QA did not pass.'
  };
}
