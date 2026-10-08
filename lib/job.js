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
const COLLECTION_QUERY=`query CollectionForQA($handle:String!){collectionByHandle(handle:$handle){id handle title}}`;
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
 let lastStatus=0;
 let lastError=null;
 for(let attempt=0;attempt<2;attempt++){
  try{
   const res=await fetch(url,{method:'GET',redirect:'follow',cache:'no-store',headers:{'User-Agent':'WattWheelz-SEO-Draft-QA/1.0'}});
   lastStatus=res.status;
   if(res.ok)return{url,status:res.status,ok:true,verifiedBy:'http'};
  }catch(e){lastError=e?.message||String(e);}
 }
 try{
  const u=new URL(url);
  const parts=u.pathname.split('/').filter(Boolean);
  if(parts[0]==='products'&&parts[1]){
   const d=await gql(auth,PRODUCT_QUERY,{handle:parts[1]});
   const p=d.productByHandle;
   if(p&&p.status==='ACTIVE')return{url,status:lastStatus,ok:true,verifiedBy:'shopify_product',resourceId:p.id};
  }
  if(parts[0]==='collections'&&parts[1]){
   const d=await gql(auth,COLLECTION_QUERY,{handle:parts[1]});
   const col=d.collectionByHandle;
   if(col)return{url,status:lastStatus,ok:true,verifiedBy:'shopify_collection',resourceId:col.id};
  }
  if(parts[0]==='blogs'&&parts[2]){
   const handle=parts[2];
   const d=await gql(auth,ARTICLE_QUERY,{q:`handle:${handle}`});
   const article=(d.articles?.nodes||[]).find(a=>a.handle===handle);
   if(article){
    if(article.isPublished)return{url,status:lastStatus,ok:true,verifiedBy:'shopify_article',resourceId:article.id};
    if(BATCH_ARTICLE_URLS.has(url))return{url,status:lastStatus,ok:true,draftTarget:true,verifiedBy:'shopify_draft',articleId:article.id};
   }
  }
 }catch(e){lastError=e?.message||String(e);}
 return{url,status:lastStatus,ok:false,error:lastError};
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
 const diagnostic={
  pass,
  batch:'brand-authority-2026-10-08',
  results:results.map(r=>({
   title:r.article?.title||r.title,
   handle:r.article?.handle||r.handle,
   pass:r.pass,
   action:r.action,
   failedQa:r.qa?Object.entries(r.qa).filter(([k,v])=>typeof v==='boolean'&&v===false).map(([k])=>k):[],
   badLinks:(r.links||[]).filter(x=>!x.ok),
   error:r.error||null
  }))
 };
 console.log('WW_SEO_BATCH_RESULT '+JSON.stringify(diagnostic));
 return{pass,action:'batch_draft_run',batch:'2026-10-07-three-blog-catchup',article_count:jobs.length,results,scope:auth.scope,handoff:pass?'All three articles are drafted and passed engine QA. Next gate: V4 review + human approval before any publication.':'Batch stopped short of publication. Fix failed QA items before human approval/publish.'};
}


export async function runPublishJob(auth){
 if(!auth?.shop||!auth?.token)throw new Error('Authenticated Shopify OAuth context is required');
 const preflight=await runDraftJob(auth);
 if(!preflight.pass){
  return{pass:false,action:'publish_blocked',preflight,safety:'No publication action was executed because the approved batch no longer passes preflight.'};
 }
 const published=[];
 for(const job of jobs){
  const manifest=job.manifest;
  const d=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
  const matches=(d.articles?.nodes||[]).filter(a=>a.handle===manifest.handle);
  if(matches.length!==1)throw new Error(`Expected one article for ${manifest.handle}; found ${matches.length}`);
  let article=matches[0];
  if(!article.isPublished){
   const u=await gql(auth,UPDATE,{id:article.id,article:{isPublished:true}});
   if(u.articleUpdate.userErrors?.length)throw new Error(JSON.stringify(u.articleUpdate.userErrors));
  }
  const verify=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
  article=(verify.articles?.nodes||[]).find(a=>a.handle===manifest.handle);
  if(!article?.isPublished||!article?.publishedAt)throw new Error(`Publication verification failed for ${manifest.handle}`);
  const url=`https://wattwheelz.com/blogs/${manifest.blog_handle}/${manifest.handle}`;
  let live={url,status:0,ok:false};
  try{
   const res=await fetch(url,{method:'GET',redirect:'follow',cache:'no-store',headers:{'User-Agent':'WattWheelz-SEO-Live-QA/1.0'}});
   live={url,status:res.status,ok:res.ok};
  }catch(error){
   live={url,status:0,ok:false,error:error?.message||String(error)};
  }
  published.push({id:article.id,title:article.title,handle:article.handle,url,isPublished:article.isPublished,publishedAt:article.publishedAt,live});
 }
 const pass=published.every(x=>x.isPublished&&x.publishedAt&&x.live.ok);
 return{pass,action:'published_approved_batch',batch:'2026-10-07-three-blog-catchup',article_count:published.length,published,handoff:pass?'All three approved articles are live and passed immediate live-page QA.':'Articles were published, but at least one live-page check needs review.'};
}
