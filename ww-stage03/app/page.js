import { listManifests } from '../lib/manifest.js';
import { publicConfigStatus } from '../lib/config.js';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const jobs = listManifests();
  const status = publicConfigStatus();
  const eligibleJobs = jobs.filter(job => job.publish_readiness === 'pilot_approved');
  const completedJobs = jobs.filter(job => job.lock_reason === 'already_published_and_live_qa_passed');

  return <main style={{fontFamily:'Arial, sans-serif',maxWidth:980,margin:'48px auto',padding:24,lineHeight:1.55,color:'#111827'}}>
    <h1>WattWheelz Controlled Publishing</h1>
    <p><strong>Human approval required.</strong> Preparing an approval does not publish. Shopify authorization runs first, then Stage 03 checks the current draft, active products, internal links, metadata, imagery, and an exact content fingerprint before showing the final Publish button.</p>

    <section style={{border:'1px solid #d1d5db',borderRadius:10,padding:20,margin:'22px 0'}}>
      <h2>Environment readiness</h2>
      <pre style={{whiteSpace:'pre-wrap',background:'#f8fafc',padding:14}}>{JSON.stringify(status,null,2)}</pre>
      <p style={{fontSize:14,color:'#166534',marginTop:10}}>
        Shopify authorization: <strong>OAuth / on demand</strong> — WattWheelz does not support Shopify client-credentials authorization, so live state is revalidated securely after you authorize and before an approval can be issued.
      </p>
    </section>

    <section style={{border:'1px solid #d1d5db',borderRadius:10,padding:20}}>
      <h2>Publishing jobs</h2>
      {eligibleJobs.length ? <form method="post" action="/api/shopify/start">
          <label htmlFor="job"><strong>Ready for controlled review</strong></label><br/>
          <select id="job" name="job" style={{width:'100%',padding:10,margin:'6px 0 14px'}}>
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

    <p style={{fontSize:14,color:'#4b5563'}}>Authorization never publishes. Stage 03 refuses already-live articles, changed drafts, inactive products, broken internal links, invalid SEO metadata, failed cover checks, or expired approvals. Critical live-QA failure after your final click automatically returns the article to draft.</p>
  </main>;
}
