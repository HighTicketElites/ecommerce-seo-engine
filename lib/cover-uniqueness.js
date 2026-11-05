// WattWheelz: global editorial cover uniqueness gate.
// A copied Shopify Article image gets a generated UUID suffix. Normalize it
// so a different filename for the SAME product source photo still counts as a duplicate.
export function coverIdentity(rawUrl) {
  if (!rawUrl) return '';
  try {
    const filename = new URL(String(rawUrl)).pathname.split('/').pop() || '';
    return filename.replace(/_[0-9a-f]{8}-[0-9a-f-]{27,36}(?=\.[a-z0-9]+$)/i, '').toLowerCase();
  } catch {
    return '';
  }
}

export function registerCover(owners, imageUrl, handle) {
  const identity = coverIdentity(imageUrl);
  if (!identity || !handle) return;
  if (!owners.has(identity)) owners.set(identity, new Set());
  owners.get(identity).add(handle);
}

export function coverIsUnique(imageUrl, owners, currentHandle) {
  const identity = coverIdentity(imageUrl);
  if (!identity || !(owners instanceof Map)) return false;
  const otherOwners = owners.get(identity);
  return !otherOwners || [...otherOwners].every(handle => handle === currentHandle);
}

export function selectUniqueCoverImage(images, owners, currentHandle) {
  if (!(owners instanceof Map) || !currentHandle) throw new Error('Cover uniqueness inventory and article handle are required');
  const choices = (images || []).filter(image => image?.url && coverIsUnique(image.url, owners, currentHandle));
  const preferred = choices.find(img => Number(img.width) >= 900 && Number(img.height) >= 500 && Number(img.width) / Number(img.height) >= 1.5 && Number(img.width) / Number(img.height) <= 2);
  const selected = preferred || choices[0];
  if (!selected) throw new Error('No distinctive unused catalog cover remains for this article. Select new authentic editorial photography; duplicate covers are prohibited.');
  return selected;
}

const COVER_INVENTORY_QUERY = `query WattWheelzAllArticleCovers($after:String) {
  articles(first:250,after:$after) {
    nodes { handle image { url } }
    pageInfo { hasNextPage endCursor }
  }
}`;

// Include drafts as well as live posts. Paginate rather than checking only the
// first 50 articles, so growth of the SEO library cannot silently bypass QA.
export async function loadCoverInventory(auth, graphql) {
  const owners = new Map();
  let after = null;
  for (let page = 0; page < 20; page += 1) {
    const data = await graphql(auth, COVER_INVENTORY_QUERY, { after });
    const records = data?.articles?.nodes;
    if (!Array.isArray(records)) throw new Error('Unable to read Shopify article covers; draft work is blocked.');
    for (const record of records) registerCover(owners, record?.image?.url, record?.handle);
    const info = data.articles.pageInfo;
    if (!info?.hasNextPage) return owners;
    if (!info.endCursor || info.endCursor === after) throw new Error('Shopify cover inventory pagination failed closed');
    after = info.endCursor;
  }
  throw new Error('Shopify cover inventory exceeds the safe pagination limit; no article cover may be reused.');
}
