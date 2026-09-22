import fs from 'node:fs';
import path from 'node:path';

const MANIFEST_DIR = path.join(process.cwd(), 'data', 'manifests');
const BODY_DIR = path.join(process.cwd(), 'data', 'bodies');
const ID = /^[a-z0-9][a-z0-9-]{2,80}$/;

export function validateManifest(m) {
  const required = ['id','title','handle','blog_handle','draft_readiness','publish_readiness','seo_title','meta_description','excerpt','tags','product_handles','required_internal_links','source_urls','image_slots','cover_image','qa'];
  for (const key of required) if (m[key] == null) throw new Error(`Manifest missing ${key}`);
  if (!ID.test(m.id) || !ID.test(m.handle) || !ID.test(m.blog_handle)) throw new Error(`Manifest identifier is invalid: ${m.id}`);
  if (!['research_required','approved'].includes(m.draft_readiness)) throw new Error(`Invalid draft_readiness for ${m.id}`);
  if (!['pilot_approved','locked'].includes(m.publish_readiness)) throw new Error(`Invalid publish_readiness for ${m.id}`);
  if (m.publish_readiness === 'pilot_approved' && m.draft_readiness !== 'approved') throw new Error(`${m.id} cannot be publish-approved before draft approval`);
  if (!Array.isArray(m.product_handles) || !m.product_handles.length) throw new Error(`${m.id} requires at least one product handle`);
  if (!Array.isArray(m.required_internal_links) || m.required_internal_links.length < 3) throw new Error(`${m.id} requires at least three internal links`);
  for (const url of m.required_internal_links) if (new URL(url).hostname !== 'resideterra.com') throw new Error(`${m.id} contains a non-ResideTerra internal link`);
  if (m.seo_title.length < 30 || m.seo_title.length > 60) throw new Error(`${m.id} SEO title must be 30–60 characters`);
  if (m.meta_description.length < 120 || m.meta_description.length > 160) throw new Error(`${m.id} meta description must be 120–160 characters`);
  if (m.cover_image.asset_kind !== 'editorial_cover') throw new Error(`${m.id} requires an editorial cover asset`);
  if (m.cover_image.aspect_ratio !== '16:9') throw new Error(`${m.id} cover image must use the 16:9 editorial ratio`);
  if (m.draft_readiness === 'approved') {
    let coverUrl;
    try { coverUrl = new URL(m.cover_image.url); } catch { throw new Error(`${m.id} approved cover image URL is invalid`); }
    if (coverUrl.protocol !== 'https:' || coverUrl.hostname !== 'cdn.shopify.com') throw new Error(`${m.id} approved cover image must be a Shopify CDN HTTPS asset`);
    if (!m.cover_image.alt || m.cover_image.alt.length < 20) throw new Error(`${m.id} approved cover image requires descriptive alt text`);
    if (!m.cover_image.provenance || m.cover_image.provenance === 'pending') throw new Error(`${m.id} approved cover image requires recorded provenance`);
  } else if (m.cover_image.status !== 'required') {
    throw new Error(`${m.id} research-locked cover image must remain visibly required`);
  }
  return m;
}

export function loadManifest(id) {
  if (!ID.test(id)) throw new Error('Invalid job identifier');
  const file = path.join(MANIFEST_DIR, `${id}.json`);
  if (!fs.existsSync(file)) throw new Error(`Unknown draft job: ${id}`);
  return validateManifest(JSON.parse(fs.readFileSync(file, 'utf8')));
}

export function listManifests() {
  return fs.readdirSync(MANIFEST_DIR).filter(x => x.endsWith('.json')).sort().map(file => loadManifest(file.replace(/\.json$/,'')));
}

export function loadBody(manifest) {
  const file = path.join(BODY_DIR, `${manifest.id}.html`);
  if (!fs.existsSync(file)) throw new Error(`Body file missing for ${manifest.id}`);
  return fs.readFileSync(file, 'utf8');
}
