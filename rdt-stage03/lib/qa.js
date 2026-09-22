import { articleFingerprint } from './fingerprint.js';
import { countTag, extractInternalLinks, wordCount } from './html.js';

function assetName(url) {
  try { return new URL(url).pathname.split('/').pop(); } catch { return ''; }
}

export async function linkStatus(url, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(url,{method:'GET',redirect:'follow',cache:'no-store',headers:{'User-Agent':'Resideterra-Publishing-QA/1.0'}});
    return {url,status:res.status,ok:res.ok,final_url:res.url};
  } catch (error) { return {url,status:0,ok:false,error:error.message}; }
}

async function sharedEvaluation({article,manifest,fetchImpl,expectedPublished}) {
  const body = article.body || '';
  const internal = extractInternalLinks(body);
  const links = [];
  for (const url of internal) links.push(await linkStatus(url, fetchImpl));
  const cover = await linkStatus(article.image?.url || '', fetchImpl);
  const required = manifest.required_internal_links.map(url => ({url,present:body.includes(url) || body.includes(new URL(url).pathname)}));
  const coverRatio = article.image?.width && article.image?.height ? article.image.width / article.image.height : 0;
  const checks = {
    publication_state: expectedPublished ? article.isPublished === true && Boolean(article.publishedAt) : article.isPublished === false && article.publishedAt == null,
    correct_blog: article.blog?.handle === manifest.blog_handle,
    correct_handle: article.handle === manifest.handle,
    no_h1: countTag(body,'h1') === 0,
    minimum_words: wordCount(body) >= manifest.qa.minimum_words,
    minimum_h2: countTag(body,'h2') >= manifest.qa.minimum_h2,
    minimum_faq: countTag(body,'h3') >= manifest.qa.minimum_faq,
    minimum_images: countTag(body,'img') >= manifest.qa.minimum_images,
    editorial_cover: Boolean(article.image?.url) && assetName(article.image.url) === assetName(manifest.cover_image.url),
    editorial_cover_alt: article.image?.altText === manifest.cover_image.alt,
    editorial_cover_ratio: coverRatio >= 1.5 && coverRatio <= 2,
    editorial_cover_loads: cover.ok,
    sources_section: /Sources\s*(?:&|&amp;|and)\s*Verification/i.test(body),
    unresolved_placeholders: !/\[\[[^\]]+\]\]|\{\{[^}]+\}\}|RDT_IMAGE:/.test(body),
    seo_title: article.titleTag?.value === manifest.seo_title,
    meta_description: article.descriptionTag?.value === manifest.meta_description,
    required_links: required.every(x => x.present),
    internal_links: links.every(x => x.ok),
  };
  return {checks,required,links,cover,metrics:{words:wordCount(body),h2:countTag(body,'h2'),faq:countTag(body,'h3'),images:countTag(body,'img'),cover_width:article.image?.width||0,cover_height:article.image?.height||0}};
}

export async function evaluateDraft({article,manifest,fetchImpl = fetch}) {
  const result = await sharedEvaluation({article,manifest,fetchImpl,expectedPublished:false});
  return {...result,pass:Object.values(result.checks).every(Boolean)};
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();
}

function metaContent(html, attribute, value) {
  const tags = String(html).match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const attrs = Object.fromEntries([...tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gi)].map(match => [match[1].toLowerCase(), decodeHtml(match[3])]));
    if (attrs[attribute] === value) return attrs.content || '';
  }
  return '';
}

function storefrontTitle(html) {
  return decodeHtml(String(html).match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s*\|\s*Resideterra\s*$/i, '').trim();
}

async function livePageStatus(url, article, manifest, fetchImpl) {
  let last = {url,status:0,ok:false,title_present:false,seo_title_matches:false,meta_description_matches:false,cover_present:false};
  for (let attempt=1;attempt<=3;attempt++) {
    try {
      const res = await fetchImpl(url,{method:'GET',redirect:'follow',cache:'no-store',headers:{'User-Agent':'Resideterra-Publishing-QA/1.0'}});
      const text = await res.text();
      const liveTitle = storefrontTitle(text);
      const liveDescription = metaContent(text,'name','description');
      const coverAsset = assetName(manifest.cover_image.url);
      last = {
        url,
        status:res.status,
        ok:res.ok,
        final_url:res.url,
        title_present:text.includes(article.title),
        seo_title_matches:liveTitle === manifest.seo_title,
        meta_description_matches:liveDescription === manifest.meta_description,
        cover_present:Boolean(coverAsset) && text.includes(coverAsset),
        live_seo_title:liveTitle,
        live_meta_description:liveDescription,
        attempt,
      };
      if (last.ok && last.title_present && last.seo_title_matches && last.meta_description_matches && last.cover_present) return last;
    } catch (error) {
      last = {url,status:0,ok:false,title_present:false,seo_title_matches:false,meta_description_matches:false,cover_present:false,error:error.message,attempt};
    }
    if (attempt < 3) await new Promise(resolve => setTimeout(resolve,attempt*800));
  }
  return last;
}

export async function evaluatePublished({article,manifest,expectedFingerprint,fetchImpl = fetch}) {
  const result = await sharedEvaluation({article,manifest,fetchImpl,expectedPublished:true});
  const liveUrl = `https://resideterra.com/blogs/${manifest.blog_handle}/${manifest.handle}`;
  const live = await livePageStatus(liveUrl,article,manifest,fetchImpl);
  const checks = {
    ...result.checks,
    content_fingerprint: articleFingerprint(article) === expectedFingerprint,
    live_page: live.ok && live.title_present,
    live_seo_title: live.seo_title_matches,
    live_meta_description: live.meta_description_matches,
    live_editorial_cover: live.cover_present,
  };
  return {...result,checks,live,pass:Object.values(checks).every(Boolean)};
}
