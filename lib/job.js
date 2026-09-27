import { gql } from './shopify.js';
import manifest from '../data/ascentiz-h-ultra-manifest.js';
import body01 from '../data/ascentiz-h-ultra-body-01.js';
import body02 from '../data/ascentiz-h-ultra-body-02.js';
import body03 from '../data/ascentiz-h-ultra-body-03.js';
import body04 from '../data/ascentiz-h-ultra-body-04.js';
import body05 from '../data/ascentiz-h-ultra-body-05.js';
import body06 from '../data/ascentiz-h-ultra-body-06.js';
import body07 from '../data/ascentiz-h-ultra-body-07.js';

const sourceBody=[body01,body02,body03,body04,body05,body06,body07].join('');
const PRODUCT_HANDLE='ascentiz-h-ultra-powered-exoskeleton';

const PRODUCT_QUERY=`
query ProductForArticle($handle:String!){
 productByHandle(handle:$handle){
  id handle title status vendor
  priceRangeV2{minVariantPrice{amount currencyCode}}
  featuredMedia{preview{image{url altText width height}}}
  media(first:20){nodes{... on MediaImage{image{url altText width height}}}}
 }
}`;
const BLOGS_QUERY=`query{blogs(first:100){nodes{id title handle}}}`;
const CREATE_BLOG=`mutation CreateBlog($blog:BlogCreateInput!){blogCreate(blog:$blog){blog{id title handle} userErrors{code field message}}}`;
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
function chooseImages(product){
 const all=[];const f=product?.featuredMedia?.preview?.image;if(f?.url)all.push(f);
 for(const node of product?.media?.nodes||[]){const img=node?.image;if(img?.url&&!all.some(x=>x.url===img.url))all.push(img);}
 if(!all.length)throw new Error('No authentic Shopify product images found for Ascentiz H Ultra');
 return{featured:all[0],full:all[0],detail:all[1]||all[0],alternate:all[4]||all[2]||all[1]||all[0]};
}
function imgFigure(image,alt,caption){return `<figure><img src="${htmlEscape(image.url)}" alt="${htmlEscape(alt)}" loading="lazy" style="max-width:100%;height:auto"/><figcaption>${htmlEscape(caption)}</figcaption></figure>`;}
function buildBody(product,images){
 let body=sourceBody;const price=product?.priceRangeV2?.minVariantPrice;
 if(price?.amount)body=body.replace(/At the time of this comparison, WattWheelz lists the H Ultra from \$1,699/g,`At the time of this comparison, WattWheelz lists the H Ultra from $${Number(price.amount).toLocaleString('en-US',{maximumFractionDigits:2})}`);
 body=body.replace('<!-- IMAGE 1: Authentic current Ascentiz H Ultra full product image. -->',imgFigure(images.full,'Ascentiz H Ultra powered hiking exoskeleton','Current Ascentiz H Ultra powered exoskeleton product image.'));
 body=body.replace('<!-- IMAGE 2: Authentic current Ascentiz H Ultra lifestyle or detail image. -->',imgFigure(images.detail,'Ascentiz H Ultra hiking exoskeleton detail','Authentic Ascentiz H Ultra product detail.'));
 body=body.replace('<!-- IMAGE 3: Authentic current Ascentiz H Ultra alternate product image. -->',imgFigure(images.alternate,'Ascentiz H Ultra long-range hiking exoskeleton','Authentic Ascentiz H Ultra alternate product image.'));
 return body;
}
function wordCount(html){return html.replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').trim().split(/\s+/).filter(Boolean).length;}
function countTag(html,tag){return(html.match(new RegExp(`<${tag}\\b`,'gi'))||[]).length;}
function internalLinks(html){return[...html.matchAll(/href=["'](https:\/\/wattwheelz\.com\/[^"']+)["']/gi)].map(m=>m[1]);}
async function linkStatus(url){try{const res=await fetch(url,{method:'GET',redirect:'follow',cache:'no-store',headers:{'User-Agent':'WattWheelz-SEO-Draft-QA/1.0'}});return{url,status:res.status,ok:res.ok};}catch(e){return{url,status:0,ok:false,error:e.message};}}
function metafields(existing){
 const out=[];if(existing?.titleTag?.id)out.push({id:existing.titleTag.id,value:manifest.seo_title});else out.push({namespace:'global',key:'title_tag',value:manifest.seo_title,type:'single_line_text_field'});
 if(existing?.descriptionTag?.id)out.push({id:existing.descriptionTag.id,value:manifest.meta_description});else out.push({namespace:'global',key:'description_tag',value:manifest.meta_description,type:'single_line_text_field'});return out;
}
async function ensureBlog(auth){
 const data=await gql(auth,BLOGS_QUERY);let blog=(data.blogs?.nodes||[]).find(b=>b.handle===manifest.blog_handle);
 if(blog)return{blog,created:false};
 const made=await gql(auth,CREATE_BLOG,{blog:{title:manifest.blog_title,handle:manifest.blog_handle}});
 if(made.blogCreate.userErrors?.length)throw new Error(`blogCreate failed: ${JSON.stringify(made.blogCreate.userErrors)}`);
 return{blog:made.blogCreate.blog,created:true};
}

export async function runDraftJob(auth){
 if(!auth?.shop||!auth?.token)throw new Error('Authenticated Shopify OAuth context is required');
 const scopeSet=new Set((auth.scope||'').split(',').map(s=>s.trim()).filter(Boolean));
 if(!scopeSet.has('write_content'))throw new Error(`Token missing write_content. Granted: ${auth.scope}`);
 if(!scopeSet.has('read_products'))throw new Error(`Token missing read_products. Granted: ${auth.scope}`);

 const prodData=await gql(auth,PRODUCT_QUERY,{handle:PRODUCT_HANDLE});const product=prodData.productByHandle;
 if(!product)throw new Error(`Shopify product not found: ${PRODUCT_HANDLE}`);
 if(product.status!=='ACTIVE')throw new Error(`Ascentiz H Ultra product status is ${product.status}; draft generation stopped`);

 const {blog,created:blogCreated}=await ensureBlog(auth);
 const existingData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});
 const matches=(existingData.articles?.nodes||[]).filter(a=>a.handle===manifest.handle);
 if(matches.length>1)throw new Error(`Duplicate article handle detected: ${manifest.handle}`);
 const existing=matches[0]||null;if(existing?.isPublished)throw new Error('Existing H Ultra guide is published; draft generator refuses to modify a live article');

 const images=chooseImages(product);const body=buildBody(product,images);
 const articleInput={blogId:blog.id,title:manifest.title,handle:manifest.handle,body,summary:manifest.excerpt,tags:manifest.tags,author:{name:'WattWheelz'},isPublished:false,image:{url:images.featured.url,altText:'Ascentiz H Ultra powered hiking exoskeleton'},metafields:metafields(existing)};
 let action;
 if(existing){const data=await gql(auth,UPDATE,{id:existing.id,article:articleInput});if(data.articleUpdate.userErrors?.length)throw new Error(`articleUpdate failed: ${JSON.stringify(data.articleUpdate.userErrors)}`);action='updated_existing_draft';}
 else{const data=await gql(auth,CREATE,{article:articleInput});if(data.articleCreate.userErrors?.length)throw new Error(`articleCreate failed: ${JSON.stringify(data.articleCreate.userErrors)}`);action='created_new_draft';}

 const finalData=await gql(auth,ARTICLE_QUERY,{q:`handle:${manifest.handle}`});const finalMatches=(finalData.articles?.nodes||[]).filter(a=>a.handle===manifest.handle);
 if(finalMatches.length!==1)throw new Error(`Post-write exact-handle QA expected 1 article; found ${finalMatches.length}`);
 const finalArticle=finalMatches[0];const urls=[...new Set(internalLinks(finalArticle.body||''))];const links=[];
 for(const url of urls)links.push(await linkStatus(url));
 const required=manifest.required_internal_links.map(url=>({url,present:(finalArticle.body||'').includes(url)}));const wc=wordCount(finalArticle.body||'');
 const qa={draft_only:finalArticle.isPublished===false&&finalArticle.publishedAt==null,correct_blog:finalArticle.blog?.handle===manifest.blog_handle,correct_handle:finalArticle.handle===manifest.handle,word_count:wc,word_depth_ok:wc>=manifest.qa.minimum_words,h2_count:countTag(finalArticle.body||'','h2'),h2_ok:countTag(finalArticle.body||'','h2')>=manifest.qa.minimum_h2,faq_count:countTag(finalArticle.body||'','h3'),faq_ok:countTag(finalArticle.body||'','h3')>=manifest.qa.minimum_faq,no_h1:countTag(finalArticle.body||'','h1')===0,inline_images:countTag(finalArticle.body||'','img'),images_ok:countTag(finalArticle.body||'','img')>=3,featured_image:Boolean(finalArticle.image?.url),featured_alt:Boolean(finalArticle.image?.altText),sources:/Sources\s*(?:&|&amp;|and)\s*Verification/i.test(finalArticle.body||''),seo_title:finalArticle.titleTag?.value===manifest.seo_title,meta_description:finalArticle.descriptionTag?.value===manifest.meta_description,required_links:required.every(x=>x.present),internal_links:links.every(x=>x.ok),medical_disclaimer:/not a medical device/i.test(finalArticle.body||'')};
 const pass=Object.entries(qa).filter(([k])=>!['word_count','h2_count','faq_count','inline_images'].includes(k)).every(([,v])=>v===true);
 return{pass,action,blogCreated,article:{id:finalArticle.id,title:finalArticle.title,handle:finalArticle.handle,blog:finalArticle.blog,isPublished:finalArticle.isPublished,publishedAt:finalArticle.publishedAt,image:finalArticle.image},product:{id:product.id,title:product.title,status:product.status,currentPrice:product.priceRangeV2?.minVariantPrice,imageCount:product.media?.nodes?.length||0},qa,required,links,scope:auth.scope,handoff:pass?'H Ultra draft passed engine QA. Review in Shopify, then publish when approved.':'Do not publish until draft QA passes.'};
}
