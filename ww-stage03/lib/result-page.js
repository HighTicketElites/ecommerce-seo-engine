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
  <title>${escapeHtml(title)} | WattWheelz</title>
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
<body><main><div class="brand">WattWheelz Publishing Control</div>${body}</main></body>
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
        <div class="panel"><span class="key">Blog</span><span class="value">${escapeHtml(article.blog?.title || article.blog?.handle || 'E-Bike Buying Guides')}</span></div>
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

export function renderPublicationErrorPage(error, {publicationAttempted} = {}) {
  const isPreflight=error?.code==='DRAFT_PREFLIGHT_FAILED';
  const authorizationOnly=publicationAttempted===false && !isPreflight;
  const checks=isPreflight ? (error.preflight?.checks||{}) : {};
  const failed=Object.entries(checks).filter(([,ok])=>ok===false).map(([name])=>name);
  const coverIssue=failed.some(name=>name.startsWith('editorial_cover'));
  const metrics=error?.preflight?.metrics||{};
  const width=Number(metrics.cover_width||0),height=Number(metrics.cover_height||0);
  const ratio=width>0&&height>0?(width/height).toFixed(3):'unknown';
  const descriptions={
    editorial_cover_ratio:'Cover aspect ratio must be between 1.5:1 and 2:1, preferably 16:9.',
    editorial_cover_alt:'Cover ALT text must match the approved editorial description.',
    editorial_cover:'A real current product editorial cover must exist.',
    editorial_cover_loads:'Cover image must load from its source.',
    required_links:'All required article links must be present.',
    internal_links:'All on-site links must resolve before publication.',
    unresolved_placeholders:'No unfilled draft markers are allowed.',
    seo_title:'SEO title must match the approved SEO draft.',
    meta_description:'Meta description must match the approved SEO draft.'
  };
  const failuresHtml=failed.map(name=>
    '<div class="check" style="display:block;border:1px solid #fecaca;background:#fff7f7">'+
    '<strong class="check-fail">&#10005; '+escapeHtml(label(name))+'</strong>'+
    (descriptions[name]?'<div style="font-size:13px;color:#475569;margin-top:6px">'+escapeHtml(descriptions[name])+'</div>':'')+
    '</div>'
  ).join('');
  const coverHtml=coverIssue?
    '<div class="panel" style="margin-top:18px"><span class="key">Current cover from Shopify</span>'+
    '<strong>'+escapeHtml(width||'unknown')+' × '+escapeHtml(height||'unknown')+' px (ratio '+escapeHtml(ratio)+')</strong>'+
    '<p style="margin-top:7px;font-size:13px">Use an authentic 16:9 product cover. The repair operation preserves article text, handles, and unpublished status.</p></div>':'';
  const badLinks=(error?.preflight?.links||[]).filter(item=>item.ok===false);
  const badLinksHtml=badLinks.length?
    '<div class="panel" style="margin-top:18px"><strong>Broken on-site links</strong>'+
    badLinks.map(item=>'<p style="overflow-wrap:anywhere;font-size:13px;margin-top:8px">'+escapeHtml(item.url)+' (HTTP '+escapeHtml(item.status||0)+')</p>').join('')+
    '</div>':'';
  const title=isPreflight?'The draft did not pass the final publishing checks':authorizationOnly?'Shopify authorization was not completed':'The publishing operation was not completed';
  const message=isPreflight?
    'Nothing was published. Fix the checks shown below before submitting the article again.':
    (error?.message||'An unexpected publishing error occurred.');
  const repairButton=coverIssue?
    '<a class="button secondary" href="https://wattwheelz-seo-draft-generator-info-19821198.vercel.app/api/shopify/install?mode=repair_covers">Repair draft cover only</a>':'';
  const body='<section class="card"><header class="hero">'+
    '<div class="status"><span class="dot"></span>Publishing stopped</div>'+
    '<h1>'+escapeHtml(title)+'</h1><p style="overflow-wrap:anywhere">'+escapeHtml(message)+'</p></header>'+
    '<div class="content">'+
    (isPreflight?
      '<div class="panel"><span class="key">Article</span><strong>'+escapeHtml(error?.article?.title||error?.jobId||'WattWheelz draft')+'</strong></div>'+
      '<h2 style="margin-top:24px">Failed checks ('+failed.length+')</h2><div class="checks">'+failuresHtml+'</div>'+coverHtml+badLinksHtml:
      '<div class="notice">'+(authorizationOnly?'No publish or rollback request was made by this authorization attempt. This page does not confirm the article’s current Shopify state.':'Publication was refused or the article was returned to draft. Confirm its current Shopify state before retrying.')+'</div>')+
    '<div class="notice">'+(isPreflight?'Stage 03 remains fail-closed; a draft repair cannot publish an article.':authorizationOnly?'Return to publishing control. Authorize again to check the exact current Shopify article before any publishing approval.':'Confirm current Shopify status before retrying.')+'</div>'+
    '<div class="actions">'+repairButton+'<a class="button primary" href="/">Return to publishing control</a></div></div></section>';
  return documentShell({title:'Publishing stopped',tone:'error',body});
}


export function renderApprovalPage(result) {
  const article = result?.article || {};
  const approval = result?.approval || {};
  const expires = approval.exp ? new Date(approval.exp).toISOString() : 'Not available';
  const products = result?.products || [];
  const body = `<section class="card">
    <header class="hero"><div class="status"><span class="dot"></span>Final approval required</div><h1>${escapeHtml(article.title || 'WattWheelz article')}</h1><p><strong>No publication has occurred.</strong> Shopify authorization and draft checks are complete. Review this exact draft before publishing.</p></header>
    <div class="content">
      <div class="grid">
        <div class="panel"><span class="key">Handle</span><span class="value">${escapeHtml(article.handle || 'Not available')}</span></div>
        <div class="panel"><span class="key">Blog</span><span class="value">${escapeHtml(article.blog?.title || article.blog?.handle || 'Not available')}</span></div>
        <div class="panel"><span class="key">Current state</span><span class="value">${article.isPublished ? 'Published' : 'Draft / unpublished'}</span></div>
        <div class="panel"><span class="key">Approval expires</span><span class="value">${escapeHtml(expires)}</span></div>
        <div class="panel"><span class="key">Products revalidated</span><span class="value">${escapeHtml(products.length)}</span></div>
        <div class="panel"><span class="key">Shopify auth</span><span class="value">Server-to-server</span></div>
      </div>
      <h2 style="margin-top:25px">Full draft preview</h2>
      <p style="margin-bottom:14px">SEO title: ${escapeHtml(article.seoTitle)}<br>Meta description: ${escapeHtml(article.metaDescription)}</p>
      <iframe title="Exact Shopify draft preview" sandbox="" srcdoc="${escapeHtml(`<!doctype html><html><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{font-family:Arial,sans-serif;line-height:1.65;color:#111827;padding:20px;max-width:800px;margin:auto}img{max-width:100%;height:auto}figure{margin:24px 0}table{border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}</style></head><body><h1>${escapeHtml(article.title)}</h1><img src=\"${escapeHtml(article.image?.url)}\" alt=\"${escapeHtml(article.image?.altText)}\">${article.body || ''}</body></html>`)}" style="width:100%;height:900px;border:1px solid #e5e7eb;border-radius:9px;background:white"></iframe>
      <span class="key" style="margin-top:24px">Locked content fingerprint</span><code class="fingerprint">${escapeHtml(approval.fingerprint || 'Not available')}</code>
      <div class="notice">If the article, products, links, metadata, images, or publication state changes before your click, Stage 03 will refuse publication. Critical live-QA failure triggers automatic rollback to draft.</div>
      <form method="post" action="/api/publish/execute" style="margin-top:24px">
        <input type="hidden" name="approval_nonce" value="${escapeHtml(approval.nonce || '')}">
        <button type="submit" style="padding:14px 20px;background:#991b1b;color:#fff;border:0;border-radius:9px;font-weight:800;cursor:pointer">Publish this exact article and run live QA</button>
      </form>
      <div class="actions"><a class="button secondary" href="/">Cancel and return</a></div>
    </div>
  </section>`;
  return documentShell({title:'Final publishing approval',tone:'warning',body});
}

