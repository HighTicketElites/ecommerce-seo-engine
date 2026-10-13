import { listManifests } from '../lib/manifest.js';
import { publicConfigStatus } from '../lib/config.js';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const jobs = listManifests();
  const status = publicConfigStatus();
  const params = await searchParams;
  const requestedJob = params?.job || '';

  const eligibleJobs = jobs.filter(job => job.publish_readiness === 'pilot_approved');
  const completedJobs = jobs.filter(job => job.lock_reason === 'already_published_and_live_qa_passed');
  const selectedJob = eligibleJobs.some(job => job.id === requestedJob) ? requestedJob : eligibleJobs[0]?.id || '';

  return <main style={{fontFamily:'Arial, sans-serif',maxWidth:980,margin:'48px auto',padding:24,lineHeight:1.55,color:'#111827'}}>
    <h1>WattWheelz Controlled Publishing</h1>
    <p><strong>Human approval required.</strong> Preparing an approval does not publish. Every approval expires, binds to an exact content fingerprint, and is revalidated immediately before publication.</p>

    <section style={{border:'1px solid #d1d5db',borderRadius:10,padding:20,margin:'22px 0'}}>
      <h2>Environment readiness</h2>
      <pre style={{whiteSpace:'pre-wrap',background:'#f8fafc',padding:14}}>{JSON.stringify(status,null,2)}</pre>
      <p style={{fontSize:14,color:'#166534',marginTop:10}}>
        Shopify authorization: <strong>OAuth / on demand</strong> — WattWheelz does not support Shopify client-credentials authorization. The live article state is therefore checked securely after you authorize Shopify and before a publishing approval can be issued.
      </p>
    </section>

    <section style={{border:'1px solid #d1d5db',borderRadius:10,padding:20}}>
      <h2>Publishing jobs</h2>
      {eligibleJobs.length ? <form method="post" action="/api/shopify/start">
          <label htmlFor="job"><strong>Ready for approval</strong></label><br/>
          <select id="job" name="job" defaultValue={selectedJob} style={{width:'100%',padding:10,margin:'6px 0 14px'}}>
            {eligibleJobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <button type="submit" style={{padding:'12px 18px',background:'#111827',color:'#fff',border:0,borderRadius:7,fontWeight:700}}>Authorize Shopify &amp; prepare final approval</button>
        </form>
        : <p style={{margin:0,padding:'12px 14px',background:'#f8fafc',borderRadius:7}}><strong>No jobs are ready for publishing approval.</strong></p>}

      {completedJobs.length ? <details style={{marginTop:18}}>
        <summary><strong>Completed and locked ({completedJobs.length})</strong></summary>
        <ul>{completedJobs.map(job => <li key={job.id}>{job.title}</li>)}</ul>
      </details> : null}
    </section>

    <section style={{marginTop:22,border:'1px solid #d1d5db',borderRadius:10,padding:20,background:'#f8fafc'}}>
      <h2 style={{marginTop:0}}>What happens after you choose an article</h2>
      <ol>
        <li>Authorize WattWheelz Shopify.</li>
        <li>Stage 03 checks the exact Shopify article and refuses an already-published article.</li>
        <li>It verifies active products, internal links, SEO metadata, editorial cover, and draft QA.</li>
        <li>It fingerprints the exact approved content and gives you the final human Publish button.</li>
        <li>Your approval expires after the configured approval window.</li>
        <li>Immediately before publication, every critical check and the fingerprint are validated again.</li>
        <li>After publication, live QA runs. A critical failure automatically returns the article to draft.</li>
      </ol>
    </section>

    <section style={{marginTop:22,border:'1px solid #d1d5db',borderRadius:10,padding:20,background:'#f8fafc'}}>
      <h2 style={{marginTop:0}}>WattWheelz SEO workflow</h2>
      <p style={{marginBottom:0}}>Research → content graph / roadmap → Stage 02 draft → draft QA → <strong>Stage 03 controlled publishing</strong> → human approval → publish → live QA → lock → reciprocal/internal-link pass.</p>
    </section>

    <p style={{fontSize:14,color:'#4b5563'}}>Stage 03 is fail-closed. Already-live articles, changed drafts, inactive products, broken links, invalid metadata, failed cover checks, and expired approvals are refused before publication.</p>
  </main>;
}
