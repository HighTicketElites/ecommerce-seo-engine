import crypto from 'node:crypto';

function stableUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return `${url.origin}${url.pathname}`;
  } catch {
    return String(value || '');
  }
}

export function protectedArticleState(article) {
  return {
    id: article.id,
    title: article.title,
    handle: article.handle,
    body: article.body,
    summary: article.summary,
    tags: [...(article.tags || [])].sort(),
    blog: {id:article.blog?.id || '',handle:article.blog?.handle || ''},
    image: {url:stableUrl(article.image?.url),altText:article.image?.altText || ''},
    seo: {title:article.titleTag?.value || '',description:article.descriptionTag?.value || ''},
  };
}

export function articleFingerprint(article) {
  return crypto.createHash('sha256').update(JSON.stringify(protectedArticleState(article))).digest('hex');
}
