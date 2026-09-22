function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function articleNumber(id) {
  const match = String(id || '').match(/Article\/(\d+)$/);
  return match?.[1] || '';
}

function shopHandle(shop) {
  return String(shop || '').replace(/\.myshopify\.com$/i, '');
}

function label(value) {
  return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
}

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }) + ' UTC';
}

function documentShell({title, tone, body}) {
  const palette = {
    success: {accent: '#166534', soft: '#f0fdf4'},
    warning: {accent: '#92400e', soft: '#fffbeb'},
    error: {accent: '#991b1b', soft: '#fef2f2'},
  }[tone] || {accent: '#111827', soft: '#f8fafc'};

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${escapeHtml(title)} | Resideterra</title>
  <style>
    :root{color-scheme:light;--ink:#111827;--muted:#667085;--line:#e5e7eb;--accent:${palette.accent};--soft:${palette.soft}}
    *{box-sizing:border-box}body{margin:0;background:#f6f7f9;color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.5}
    main{width:min(980px,calc(100% - 32px));margin:40px auto 64px}.brand{font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:13px;margin-bottom:18px}
    .card{background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 14px 40px rgba(15,23,42,.07);overflow:hidden}.hero{padding:30px;background:var(--soft);border-bottom:1px solid var(--line)}
    .status{display:inline-flex;align-items:center;gap:8px;color:var(--accent);font-weight:800;font-size:14px;text-transform:uppercase;letter-spacing:.04em}.dot{width:10px;height:10px;border-radius:999px;background:var(--accent)}
    h1{font-size:clamp(27px,4vw,41px);line-height:1.12;margin:12px 0 8px}h2{font-size:19px;margin:0 0 14px}p{margin:0;color:var(--muted)}
    .content{padding:28px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.panel{border:1px solid var(--line);border-radius:12px;padding:17px;background:#fff}
    .key{display:block;color:var(--muted);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}.value{font-weight:700;overflow-wrap:anywhere}
    .cover{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;border:1px solid var(--line);margin-top:18px}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}
    .metric{padding:15px;border-radius:12px;background:#f8fafc;text-align:center}.metric strong{display:block;font-size:23px}.metric span{font-size:12px;color:var(--muted)}
    .checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:14px}.check{display:flex;align-items:center;gap:9px;padding:10px 12px;background:#f8fafc;border-radius:9px;font-size:14px}.check-mark{color:#166534;font-weight:900}.check-fail{color:#991b1b}
    .products{display:grid;gap:9px;margin-top:14px}.product{display:flex;justify-content:space-between;gap:16px;padding:12px 14px;background:#f8fafc;border-radius:9px}.product span:last-child{color:#166534;font-weight:800;font-size:13px}
    .fingerprint{display:block;margin-top:10px;padding:12px;background:#f8fafc;border-radius:9px;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}
    .actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.button{display:inline-block;padding:12px 17px;border-radius:9px;text-decoration:none;font-weight:800}.primary{background:#111827;color:#fff}.secondary{border:1px solid var(--line);color:#111827;background:#fff}
    .notice{margin-top:18px;padding:14px 16px;border-radius:10px;background:var(--soft);border:1px solid var(--line);color:var(--accent);font-size:14px;font-weight:700}
    @media(max-width:680px){main{margin-top:20px}.grid,.checks{grid-template-columns:1fr}.metrics{grid-template-columns:repeat(2,1fr)}.hero,.content{padding:21px}.product{display:block}.product span:last-child{display:block;margin-top:4px}}
  </style>
</head>
<body><main><div class="brand">Resideterra Publishing Control</div>${body}</main></body>
</html>`;
}

export function renderPublicationResult(result, shop) {
  const success = result?.pass === true && result?.action === 'published_and_verified';
  const article = result?.article || {};
  const qa = result?.qa || {};
  const metrics = qa.metrics || {};
  const adminId = articleNumber(article.id);
  const adminUrl = adminId
    ? `https://admin.shopify.com/store/${encodeURIComponent(shopHandle(shop))}/content/articles/${adminId}`
    : 'https://admin.shopify.com/';
  const liveUrl = success && qa.live?.url ? qa.live.url : '';
  const coverUrl = qa.cover?.url || article.image?.url || '';
  const cover = coverUrl
    ? `<img class="cover" src="${escapeHtml(coverUrl)}" alt="${escapeHtml(article.image?.altText || article.title || 'Published article cover')}">`
    : '';
  const checks = Object.entries(qa.checks || {}).map(([name, passed]) =>
    `<div class="check"><span class="check-mark ${passed ? '' : 'check-fail'}">${passed ? '&#10003;' : '&#10005;'}</span><span>${escapeHtml(label(name))}</span></div>`
  ).join('');
  const products = (result?.products || []).map(product =>
    `<div class="product"><span>${escapeHtml(product.title || product.handle)}</span><span>${escapeHtml(product.status || 'Verified')}</span></div>`
  ).join('');
  const heading = success ? 'Published and verified' : 'Publication rolled back';
  const description = success
    ? 'The exact approved article is live and every required post-publication check passed.'
    : 'Live quality control failed, so the article was automatically returned to draft.';
  const status = success ? 'Live and verified' : 'Unpublished after rollback';
  const notice = success
    ? 'Automatic rollback was armed and was not needed. The approved content fingerprint remained unchanged.'
    : 'The article is not live. Review the failed checks below before preparing a new publishing approval.';
  const liveButton = liveUrl
    ? `<a class="button primary" href="${escapeHtml(liveUrl)}" target="_blank" rel="noreferrer">View live article</a>`
    : '';

  const body = `<section class="card">
    <header class="hero"><div class="status"><span class="dot"></span>${escapeHtml(heading)}</div><h1>${escapeHtml(article.title || label(result?.job))}</h1><p>${escapeHtml(description)}</p></header>
    <div class="content">
      <div class="grid">
        <div class="panel"><span class="key">Shopify status</span><span class="value">${escapeHtml(status)}</span></div>
        <div class="panel"><span class="key">Action</span><span class="value">${escapeHtml(label(result?.action))}</span></div>
        <div class="panel"><span class="key">Blog</span><span class="value">${escapeHtml(article.blog?.title || article.blog?.handle || 'Electric Fireplaces')}</span></div>
        <div class="panel"><span class="key">Published at</span><span class="value">${escapeHtml(formatDate(article.publishedAt))}</span></div>
      </div>
      ${cover}
      <div class="metrics">
        <div class="metric"><strong>${escapeHtml(metrics.words ?? 0)}</strong><span>Words</span></div>
        <div class="metric"><strong>${escapeHtml(metrics.h2 ?? 0)}</strong><span>H2 sections</span></div>
        <div class="metric"><strong>${escapeHtml(metrics.faq ?? 0)}</strong><span>FAQ headings</span></div>
        <div class="metric"><strong>${escapeHtml(metrics.images ?? 0)}</strong><span>Article images</span></div>
      </div>
      ${products ? `<h2 style="margin-top:25px">Revalidated products</h2><div class="products">${products}</div>` : ''}
      <h2 style="margin-top:25px">Post-publication quality control</h2><div class="checks">${checks}</div>
      <span class="key" style="margin-top:24px">Locked content fingerprint</span><code class="fingerprint">${escapeHtml(result?.fingerprint || 'Not available')}</code>
      <div class="notice">${escapeHtml(notice)}</div>
      <div class="actions">${liveButton}<a class="button secondary" href="${escapeHtml(adminUrl)}" target="_blank" rel="noreferrer">Open in Shopify</a><a class="button secondary" href="/">Return to publishing control</a></div>
    </div>
  </section>`;

  return documentShell({title: heading, tone: success ? 'success' : 'warning', body});
}

export function renderPublicationErrorPage(error) {
  const message = error?.message || 'An unexpected publishing error occurred.';
  const body = `<section class="card"><header class="hero"><div class="status"><span class="dot"></span>Publishing stopped</div><h1>The publishing operation was not completed</h1><p>${escapeHtml(message)}</p></header><div class="content"><div class="notice">Publication was refused or the article was returned to draft. Confirm its current Shopify state before retrying.</div><div class="actions"><a class="button primary" href="/">Return to publishing control</a></div></div></section>`;
  return documentShell({title: 'Publishing stopped', tone: 'error', body});
}
