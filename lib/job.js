import { gql } from './shopify.js';
import manifest from '../data/exoskeleton-cost-2026-manifest.js';
import body01 from '../data/exoskeleton-cost-2026-body-01.js';
import body02 from '../data/exoskeleton-cost-2026-body-02.js';
import body03 from '../data/exoskeleton-cost-2026-body-03.js';
import body04 from '../data/exoskeleton-cost-2026-body-04.js';
import body05 from '../data/exoskeleton-cost-2026-body-05.js';

const sourceBody=[body01,body02,body03,body04,body05].join('');
const PRODUCT_HANDLES=['ascentiz-h-pro-powered-exoskeleton','ascentiz-h-ultra-powered-exoskeleton'];

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
function buildBody(products){
 const by=Object.fromEntries(products.map(p=>[p.handle,p]));
 const pro=by[PRODUCT_HANDLES[0]], ultra=by[PRODUCT_HANDLES[1]];
 const price=p=>'$'+Number(p.priceRangeV2.minVariantPrice.amount).toLocaleString('en-US',{maximumFractionDigits:2});
 let body=sourceBody.replaceAll('{{PRICE_PRO}}',price(pro)).replaceAll('{{PRICE_ULTRA}}',price(ultra));
 const pimgs=imageList(pro), uimgs=imageList(ultra);
 body=body.replace('<!-- IMAGE PRO -->',imgFigure(pimgs[0],'Ascentiz H Pro powered exoskeleton','Ascentiz H Pro consumer powered exoskeleton.'));
 body=body.replace('<!-- IMAGE ULTRA -->',imgFigure(uimgs[0],'Ascentiz H Ultra powered exoskeleton','Ascentiz H Ultra consumer powered exoskeleton.'));
 body=body.replace('<!-- IMAGE PRO DETAIL -->',imgFigure(pimgs[1]||pimgs[0],'Ascentiz H Pro rear or detail view','Ascentiz H Pro product detail.'));
 body=body.replace('<!-- IMAGE ULTRA DETAIL -->',imgFigure(uimgs[1]||uimgs[0],'Ascentiz H Ultra rear or detail view','Ascentiz H Ultra product detail.'));
 return body;
}
function wordCount(html){return html.replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').trim().split(/\s+/).filter(Boolean).length;}
function countTag(html,tag){return(html.match(new RegExp(`<${tag}\\b`,'gi'))||[]).length;}
function internalLinks(html){return[...html.matchAll(/href=["'](https:\/\/wattwheelz\.com\/[^"']+)["']/gi)].map(m=>m[1]);}
function linkTypeCount(html,type){return(html.match(new RegExp(`href=["']https:\\/\\/wattwheelz\\.com\\/${type}\\/`,'gi'))||[]).length;}
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
   const d=await gql(auth,PRODUCT_QUERY,{handle});const p=d.productByHandle;
   if(!p)throw new Error('Shopify product not found: '+handle);
   if(p.status!=='ACTIVE')throw new Error(`Product ${handle} status is ${p.status}; stopped`);
   products.push(p);
 }

 const blogData=await gql(auth,BLOGS_QUERY);
 const blog=(blogData.blogs?.nodes||[]).find(b=>b.id===manifest.blog_id);
 if(!blog||blog.handle!==manifest.blog_handle)throw new Error('Canonical Exoskeleton Reviews & Guides blog not found');

 const existingData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
 const matches=(existingData.articles?.nodes||[]).filter(a=>a.handle===manifest.handle);
 if(matches.length>1)throw new Error('Duplicate article handle detected: '+manifest.handle);
 const existing=matches[0]||null;
 if(existing?.isPublished)throw new Error('Existing exoskeleton cost guide is published; draft generator refuses to modify live article');

 const body=buildBody(products);
 const featured=imageList(products[0])[0];
 const articleInput={blogId:blog.id,title:manifest.title,handle:manifest.handle,body,summary:manifest.excerpt,tags:manifest.tags,author:{name:'WattWheelz'},isPublished:false,image:{url:featured.url,altText:'Powered exoskeleton cost guide 2026'},metafields:metafields(existing)};
 let action;
 if(existing){const d=await gql(auth,UPDATE,{id:existing.id,article:articleInput});if(d.articleUpdate.userErrors?.length)throw new Error(JSON.stringify(d.articleUpdate.userErrors));action='updated_existing_draft';}
 else{const d=await gql(auth,CREATE,{article:articleInput});if(d.articleCreate.userErrors?.length)throw new Error(JSON.stringify(d.articleCreate.userErrors));action='created_new_draft';}

 const finalData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
 const finalArticle=(finalData.articles?.nodes||[]).find(a=>a.handle===manifest.handle);
 if(!finalArticle)throw new Error('Post-write article not found');

 const urls=[...new Set(internalLinks(finalArticle.body||''))];
 const links=[]; for(const u of urls)links.push(await linkStatus(u));
 const required=manifest.required_internal_links.map(url=>({url,present:(finalArticle.body||'').includes(url)}));
 const wc=wordCount(finalArticle.body||'');
 const pLinks=linkTypeCount(finalArticle.body||'','products');
 const cLinks=linkTypeCount(finalArticle.body||'','collections');
 const bLinks=linkTypeCount(finalArticle.body||'','blogs');
 const totalInternal=pLinks+cLinks+bLinks;

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
   internal_links_live:links.every(x=>x.ok),
   product_links:pLinks,
   product_link_depth_ok:pLinks>=manifest.qa.minimum_product_links,
   collection_links:cLinks,
   collection_link_depth_ok:cLinks>=manifest.qa.minimum_collection_links,
   related_blog_links:bLinks,
   related_blog_depth_ok:bLinks>=manifest.qa.minimum_blog_links,
   total_internal_links:totalInternal,
   internal_link_density_ok:totalInternal>=manifest.qa.minimum_internal_links
 };
 const numeric=new Set(['word_count','h2_count','faq_count','inline_images','product_links','collection_links','related_blog_links','total_internal_links']);
 const pass=Object.entries(qa).filter(([k])=>!numeric.has(k)).every(([,v])=>v===true);
 return{pass,action,article:{id:finalArticle.id,title:finalArticle.title,handle:finalArticle.handle,blog:finalArticle.blog,isPublished:finalArticle.isPublished,publishedAt:finalArticle.publishedAt,image:finalArticle.image},products:products.map(p=>({id:p.id,title:p.title,handle:p.handle,status:p.status,currentPrice:p.priceRangeV2?.minVariantPrice})),qa,required,links,scope:auth.scope,handoff:pass?'Exoskeleton cost draft passed enhanced SEO/AEO + internal-link QA. Review, then publish.':'Do not publish until all enhanced QA gates pass.'};
}
