export function htmlEscape(value) {
  return String(value ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

export function countTag(html, tag) {
  return (String(html).match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
}

export function wordCount(html) {
  return String(html).replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').trim().split(/\s+/).filter(Boolean).length;
}

export function extractInternalLinks(html) {
  const links = [];
  for (const match of String(html).matchAll(/href=["']([^"']+)["']/gi)) {
    const raw = match[1];
    if (raw.startsWith('/')) links.push(`https://resideterra.com${raw}`);
    else {
      try { const url = new URL(raw); if (url.hostname === 'resideterra.com') links.push(url.href); } catch {}
    }
  }
  return [...new Set(links)];
}

function figure(image, alt, caption) {
  return `<figure><img src="${htmlEscape(image.url)}" alt="${htmlEscape(alt)}" loading="lazy" style="max-width:100%;height:auto"><figcaption>${htmlEscape(caption)}</figcaption></figure>`;
}

export function injectRuntimeData(source, manifest, products) {
  let body = source;
  for (const product of products.values()) {
    const price = product.priceRangeV2?.minVariantPrice;
    body = body.replaceAll(`{{title:${product.handle}}}`, htmlEscape(product.title));
    if (price?.amount) body = body.replaceAll(`{{price:${product.handle}}}`, htmlEscape(`${price.currencyCode} ${Number(price.amount).toLocaleString('en-US',{maximumFractionDigits:2})}`));
  }
  for (const slot of manifest.image_slots) {
    const product = products.get(slot.product_handle);
    if (!product) throw new Error(`Image slot product missing: ${slot.product_handle}`);
    const images = [];
    const featured = product.featuredMedia?.preview?.image;
    if (featured?.url) images.push(featured);
    for (const node of product.media?.nodes || []) if (node?.image?.url && !images.some(x => x.url === node.image.url)) images.push(node.image);
    if (!images.length) throw new Error(`No authentic Shopify product media found: ${slot.product_handle}`);
    const image = images[slot.media_index] || images[0];
    const marker = `<!-- RDT_IMAGE:${slot.id} -->`;
    if (!body.includes(marker)) throw new Error(`Image marker missing: ${slot.id}`);
    body = body.replace(marker, figure(image, slot.alt, slot.caption));
  }
  return body;
}
