import { gql } from './shopify.js';
import { validateStrategy } from './strategy.js';
import jobs from '../data/oct-07-batch.js';

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

function htmlEscape(v){return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function imageList(p){const out=[];const f=p?.featuredMedia?.preview?.image;if(f?.url)out.push(f);for(const n of p?.media?.nodes||[]){if(n?.image?.url&&!out.some(x=>x.url===n.image.url))out.push(n.image);}return out;}
function imgFigure(image,alt,caption){return `<figure><img src="${htmlEscape(image.url)}" alt="${htmlEscape(alt)}" loading="lazy" style="max-width:100%;height:auto"/><figcaption>${htmlEscape(caption)}</figcaption></figure>`;}
function wordCount(html){return html.replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').trim().split(/\s+/).filter(Boolean).length;}
function countTag(html,tag){return(html.match(new RegExp(`<${tag}\\b`,'gi'))||[]).length;}
function internalLinks(html){return[...html.matchAll(/href=["'](https:\/\/wattwheelz\.com\/[^"']+)["']/gi)].map(m=>m[1]);}
function linkTypeCount(html,type){return(html.match(new RegExp(`href=["']https:\\/\\/wattwheelz\\.com\\/${type}\\/`,'gi'))||[]).length;}
const BATCH_ARTICLE_URLS=new Map(jobs.map(j=>[`https://wattwheelz.com/blogs/${j.manifest.blog_handle}/${j.manifest.handle}`,j.manifest.handle]));
async function linkStatus(auth,url){
 try{
  const res=await fetch(url,{method:'GET',redirect:'follow',cache:'no-store',headers:{'User-Agent':'WattWheelz-SEO-Draft-QA/1.0'}});
  if(res.ok)return{url,status:res.status,ok:true};
  if(res.status===404&&BATCH_ARTICLE_URLS.has(url)){
   const handle=BATCH_ARTICLE_URLS.get(url);
   const d=await gql(auth,ARTICLE_QUERY,{q:`handle:${handle}`});
   const article=(d.articles?.nodes||[]).find(a=>a.handle===handle);
   if(article&&article.isPublished===false)return{url,status:404,ok:true,draftTarget:true,articleId:article.id};
  }
  return{url,status:res.status,ok:false};
 }catch(e){return{url,status:0,ok:false,error:e.message};}
}
function metafields(existing,manifest){
 const out=[];
 if(existing?.titleTag?.id)out.push({id:existing.titleTag.id,value:manifest.seo_title});else out.push({namespace:'global',key:'title_tag',value:manifest.seo_title,type:'single_line_text_field'});
 if(existing?.descriptionTag?.id)out.push({id:existing.descriptionTag.id,value:manifest.meta_description});else out.push({namespace:'global',key:'description_tag',value:manifest.meta_description,type:'single_line_text_field'});
 return out;
}
function buildBody(job,products){
 let body=job.body;
 const by=Object.fromEntries(products.map(p=>[p.handle,p]));
 const price=p=>'$'+Number(p.priceRangeV2.minVariantPrice.amount).toLocaleString('en-US',{maximumFractionDigits:2});
 for(const p of products)body=body.replaceAll(`{{PRICE:${p.handle}}}`,price(p));
 for(const plan of job.image_plan||[]){
  const [handle,index,alt,caption]=plan;
  const p=by[handle]; if(!p)throw new Error('Image-plan product not loaded: '+handle);
  const images=imageList(p); const image=images[index]||images[0];
  if(!image)throw new Error('No product image available for '+handle);
  const marker=`<!-- IMAGE:${handle}:${index} -->`;
  if(!body.includes(marker))throw new Error('Image marker missing from source body: '+marker);
  body=body.replace(marker,imgFigure(image,alt,caption));
 }
 if(/<!-- IMAGE:/.test(body))throw new Error('Unresolved image placeholder remains');
 if(/\{\{PRICE:/.test(body))throw new Error('Unresolved price placeholder remains');
 if(job.append_html){
  const sourcesMatch=body.match(/<h2[^>]*>\s*Sources\s*(?:&|&amp;|and)\s*Verification\s*<\/h2>/i);
  if(sourcesMatch?.index!=null)body=body.slice(0,sourcesMatch.index)+job.append_html+body.slice(sourcesMatch.index);
  else body+=job.append_html;
 }
 return body;
}
async function fetchProduct(auth,handle){
 const d=await gql(auth,PRODUCT_QUERY,{handle}); const p=d.productByHandle;
 if(!p)throw new Error('Shopify product not found: '+handle);
 if(p.status!=='ACTIVE')throw new Error(`Product ${handle} status is ${p.status}; stopped`);
 return p;
}
async function runOne(auth,job,blogs){
 const manifest=job.manifest;
 const strategy=validateStrategy(manifest);
 if(!strategy.ok)throw new Error('SEO strategy gate failed: '+strategy.reason);

 const products=await Promise.all(job.product_handles.map(h=>fetchProduct(auth,h)));
 const blog=blogs.find(b=>b.handle===manifest.blog_handle);
 if(!blog)throw new Error('Canonical blog not found: '+manifest.blog_handle);

 const existingData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
 const matches=(existingData.articles?.nodes||[]).filter(a=>a.handle===manifest.handle);
 if(matches.length>1)throw new Error('Duplicate article handle detected: '+manifest.handle);
 const existing=matches[0]||null;
 if(existing?.isPublished)return{pass:true,action:'skipped_already_published',article:{id:existing.id,title:existing.title,handle:existing.handle,blog:existing.blog,isPublished:true,publishedAt:existing.publishedAt},qa:{published_article_preserved:true},handoff:'Existing live article preserved; no mutation executed.'};

 const body=buildBody(job,products);
 const featuredProduct=products.find(p=>p.handle===job.featured_handle)||products[0];
 const featured=imageList(featuredProduct)[0];
 if(!featured)throw new Error('Featured image unavailable');

 const articleInput={blogId:blog.id,title:manifest.title,handle:manifest.handle,body,summary:manifest.excerpt,tags:manifest.tags,author:{name:'WattWheelz'},isPublished:false,image:{url:featured.url,altText:job.featured_alt||manifest.title},metafields:metafields(existing,manifest)};
 let action;
 if(existing){
  const d=await gql(auth,UPDATE,{id:existing.id,article:articleInput});
  if(d.articleUpdate.userErrors?.length)throw new Error(JSON.stringify(d.articleUpdate.userErrors));
  action='updated_existing_draft';
 }else{
  const d=await gql(auth,CREATE,{article:articleInput});
  if(d.articleCreate.userErrors?.length)throw new Error(JSON.stringify(d.articleCreate.userErrors));
  action='created_new_draft';
 }

 const finalData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
 const finalArticle=(finalData.articles?.nodes||[]).find(a=>a.handle===manifest.handle);
 if(!finalArticle)throw new Error('Post-write article not found');

 const urls=[...new Set(internalLinks(finalArticle.body||''))];
 const links=await Promise.all(urls.map(url=>linkStatus(auth,url)));
 const required=(manifest.required_internal_links||[]).map(url=>({url,present:(finalArticle.body||'').includes(url)}));
 const wc=wordCount(finalArticle.body||'');
 const pLinks=linkTypeCount(finalArticle.body||'','products');
 const cLinks=linkTypeCount(finalArticle.body||'','collections');
 const bLinks=linkTypeCount(finalArticle.body||'','blogs');
 const totalInternal=pLinks+cLinks+bLinks;
 const qa={
  roadmap_entry:Boolean(strategy.entry),architecture_valid:Boolean(strategy.node),
  commercial_destinations_defined:strategy.destinations.length>0,incoming_link_targets_defined:strategy.incoming.length>=2,
  semantic_graph_assigned:Boolean(strategy.graph),semantic_blog_links_present:strategy.semantic.all.every(url=>(finalArticle.body||'').includes(url)),
  semantic_parent_links:strategy.semantic.parent.length,semantic_sibling_links:strategy.semantic.siblings.length,semantic_supporting_links:strategy.semantic.supporting.length,
  draft_only:finalArticle.isPublished===false&&finalArticle.publishedAt==null,
  correct_blog:finalArticle.blog?.handle===manifest.blog_handle,correct_handle:finalArticle.handle===manifest.handle,
  word_count:wc,word_depth_ok:wc>=manifest.qa.minimum_words,
  h2_count:countTag(finalArticle.body||'','h2'),h2_ok:countTag(finalArticle.body||'','h2')>=manifest.qa.minimum_h2,
  faq_count:countTag(finalArticle.body||'','h3'),faq_ok:countTag(finalArticle.body||'','h3')>=manifest.qa.minimum_faq,
  no_h1:countTag(finalArticle.body||'','h1')===0,
  inline_images:countTag(finalArticle.body||'','img'),images_ok:countTag(finalArticle.body||'','img')>=manifest.qa.minimum_images,
  featured_image:Boolean(finalArticle.image?.url),featured_alt:Boolean(finalArticle.image?.altText),
  sources:/Sources\s*(?:&|&amp;|and)\s*Verification/i.test(finalArticle.body||''),
  seo_title:finalArticle.titleTag?.value===manifest.seo_title,meta_description:finalArticle.descriptionTag?.value===manifest.meta_description,
  required_links:required.every(x=>x.present),internal_links_live:links.every(x=>x.ok),
  product_links:pLinks,product_link_depth_ok:pLinks>=manifest.qa.minimum_product_links,
  collection_links:cLinks,collection_link_depth_ok:cLinks>=manifest.qa.minimum_collection_links,
  related_blog_links:bLinks,related_blog_depth_ok:bLinks>=manifest.qa.minimum_blog_links,
  total_internal_links:totalInternal,internal_link_density_ok:totalInternal>=manifest.qa.minimum_internal_links
 };
 const numeric=new Set(['word_count','h2_count','faq_count','inline_images','product_links','collection_links','related_blog_links','total_internal_links','semantic_parent_links','semantic_sibling_links','semantic_supporting_links']);
 const pass=Object.entries(qa).filter(([k])=>!numeric.has(k)).every(([,v])=>v===true);
 return{pass,action,article:{id:finalArticle.id,title:finalArticle.title,handle:finalArticle.handle,blog:finalArticle.blog,isPublished:finalArticle.isPublished,publishedAt:finalArticle.publishedAt,image:finalArticle.image},products:products.map(p=>({id:p.id,title:p.title,handle:p.handle,status:p.status,currentPrice:p.priceRangeV2?.minVariantPrice})),qa,required,links,handoff:pass?'Draft passed SEO/AEO + graph + internal-link QA. Hold for V4/human approval.':'Do not publish until every QA gate passes.'};
}

export async function runDraftJob(auth){
 if(!auth?.shop||!auth?.token)throw new Error('Authenticated Shopify OAuth context is required');
 const scopeSet=new Set((auth.scope||'').split(',').map(s=>s.trim()).filter(Boolean));
 if(!scopeSet.has('write_content'))throw new Error(`Token missing write_content. Granted: ${auth.scope}`);
 if(!scopeSet.has('read_products'))throw new Error(`Token missing read_products. Granted: ${auth.scope}`);
 const blogData=await gql(auth,BLOGS_QUERY); const blogs=blogData.blogs?.nodes||[];
 const results=[];
 for(const job of jobs){
  try{results.push(await runOne(auth,job,blogs));}
  catch(error){results.push({pass:false,action:'stopped_safely',title:job.manifest.title,handle:job.manifest.handle,error:error?.message||String(error),safety:'No publication action was executed for this article.'});}
 }
 const pass=results.every(r=>r.pass===true);
 return{pass,action:'batch_draft_run',batch:'2026-10-07-three-blog-catchup',article_count:jobs.length,results,scope:auth.scope,handoff:pass?'All three articles are drafted and passed engine QA. Next gate: V4 review + human approval before any publication.':'Batch stopped short of publication. Fix failed QA items before human approval/publish.'};
}
