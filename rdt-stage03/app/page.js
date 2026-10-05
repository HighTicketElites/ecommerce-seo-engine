import { listManifests } from '../lib/manifest.js';
import { publicConfigStatus } from '../lib/config.js';
import { ARTICLE_QUERY } from '../lib/publish.js';
import { gql, serverAuth } from '../lib/shopify.js';

export const dynamic = 'force-dynamic';

async function livePublicationState(jobs) {
  const state = {};
  try {
    const auth = await serverAuth();
    for (const job of jobs) {
      if (job.publish_readiness !== 'pilot_approved') continue;
      const data = await gql(auth, ARTICLE_QUERY, {q:`handle:${job.handle}`});
      const article = (data.articles?.nodes || []).find(node => node.handle === job.handle);
      state[job.id] = article ? {
        found: true,
        isPublished: article.isPublished === true,
        publishedAt: article.publishedAt || null,
        updatedAt: article.updatedAt || null,
        title: article.title,
      } : {found:false,isPublished:false};
    }
    return {ok:true,state};
  } catch (error) {
    return {ok:false,state,error:error?.message || String(error)};
  }
}

export default async function Home() {
  const jobs = listManifests();
  const status = publicConfigStatus();
  const live = await livePublicationState(jobs);
  const eligibleJobs = jobs.filter(job =>
    job.publish_readiness === 'pilot_approved' &&
    live.state[job.id]?.isPublished !== true
  );
  const publishedUnreconciled = jobs.filter(job =>
    job.publish_readiness === 'pilot_approved' &&
    live.state[job.id]?.isPublished === true
  );
  const completedJobs = jobs.filter(job => job.lock_reason === 'already_published_and_live_qa_passed');

  return <main style={{fontFamily:'Arial, sans-serif',maxWidth:980,margin:'48px auto',padding:24,lineHeight:1.55,color:'#111827'}}>
    <h1>Resideterra Controlled Publishing</h1>
    <p><strong>Human approval required.</strong> Preparing an approval does not publish. Every approval expires, binds to an exact content fingerprint, and is revalidated immediately before publication.</p>

    <section style={{border:'1px solid #d1d5db',borderRadius:10,padding:20,margin:'22px 0'}}>
      <h2>Environment readiness</h2>
      <pre style={{whiteSpace:'pre-wrap',background:'#f8fafc',padding:14}}>{JSON.stringify(status,null,2)}</pre>
      <p style={{fontSize:14,color:live.ok?'#166534':'#991b1b',marginTop:10}}>
        Shopify live-state check: <strong>{live.ok ? 'Connected' : 'Unavailable'}</strong>
        {live.ok ? ' — approval availability is reconciled against the actual Shopify article state.' : ` — ${live.error}`}
      </p>
    </section>

    {publishedUnreconciled.length ? <section style={{border:'1px solid #f59e0b',background:'#fffbeb',borderRadius:10,padding:20,margin:'22px 0'}}>
      <h2 style={{marginTop:0}}>Published in Shopify — reconciliation required</h2>
      <p>These articles are already visible in Shopify, so Stage 03 will not offer them for publication again.</p>
      <ul>
        {publishedUnreconciled.map(job => <li key={job.id}><strong>{job.title}</strong>{live.state[job.id]?.publishedAt ? ` — published ${live.state[job.id].publishedAt}` : ''}</li>)}
      </ul>
    </section> : null}

    <section style={{border:'1px solid #d1d5db',borderRadius:10,padding:20}}>
      <h2>Publishing jobs</h2>
      {eligibleJobs.length ? <form method="post" action="/api/shopify/start">
          <label htmlFor="job"><strong>Ready for approval</strong></label><br/>
          <select id="job" name="job" style={{width:'100%',padding:10,margin:'6px 0 14px'}}>
            {eligibleJobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <button type="submit" style={{padding:'12px 18px',background:'#111827',color:'#fff',border:0,borderRadius:7,fontWeight:700}}>Prepare final publishing approval</button>
        </form>
        : <p style={{margin:0,padding:'12px 14px',background:'#f8fafc',borderRadius:7}}><strong>No unpublished jobs are ready for publishing approval.</strong> New jobs appear here only after draft QA, editorial-cover verification, explicit Stage 03 approval, and a live Shopify state check.</p>}

      {completedJobs.length ? <details style={{marginTop:18}}>
        <summary><strong>Completed and locked ({completedJobs.length})</strong></summary>
        <ul>{completedJobs.map(job => <li key={job.id}>{job.title}</li>)}</ul>
      </details> : null}
    </section>

    <p style={{fontSize:14,color:'#4b5563'}}>Only approved, currently unpublished draft jobs are selectable. Shopify-visible articles are blocked from replay, completed articles remain locked, and failed live QA triggers an automatic return to draft.</p>
  </main>;
}
