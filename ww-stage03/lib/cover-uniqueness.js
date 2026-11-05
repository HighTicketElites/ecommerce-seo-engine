// Publishing-time independent check, fail closed if a different Shopify
// article already uses the same underlying product photo as a featured cover.
const INVENTORY = `query WattWheelzCoverCollisionAudit($after:String) {
  articles(first:250,after:$after) {
    nodes { id handle image { url } }
    pageInfo { hasNextPage endCursor }
  }
}`;

export function coverIdentity(raw) {
  try {
    const file = new URL(String(raw || '')).pathname.split('/').pop() || '';
    return file.replace(/(?:_[0-9a-f]{8}-[0-9a-f-]{27,36})+(?=\.[a-z0-9]+$)/ig, '').toLowerCase();
  } catch { return ''; }
}

export async function assertUniqueArticleCover(auth,article,graphql,env) {
  const candidate=coverIdentity(article?.image?.url);
  if (!candidate) throw new Error('Publishing stopped: article has no verifiable editorial cover identity.');
  let after=null;
  for (let page=0;page<20;page++) {
    const res=await graphql(auth,INVENTORY,{after},env);
    const list=res?.articles?.nodes;
    if (!Array.isArray(list)) throw new Error('Publishing stopped: Shopify editorial cover inventory unavailable.');
    for (const record of list) {
      if (record.id !== article.id && coverIdentity(record.image?.url) === candidate)
        throw new Error(`Publishing stopped: cover is already used by article "${record.handle}". Use distinct authentic featured photography, then re-run QA.`);
    }
    if (!res.articles.pageInfo?.hasNextPage) return;
    if (!res.articles.pageInfo.endCursor || res.articles.pageInfo.endCursor===after)
      throw new Error('Publishing stopped: cover inventory pagination incomplete.');
    after=res.articles.pageInfo.endCursor;
  }
  throw new Error('Publishing stopped: cover inventory exceeded audit limit.');
}
