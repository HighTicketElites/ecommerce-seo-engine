import { listManifests, loadBody } from '../lib/manifest.js';
import { publicConfigStatus } from '../lib/config.js';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const jobs = listManifests();
  const status = publicConfigStatus();
  const params = await searchParams;
  const requestedJob = params?.job || '';

  const eligibleJobs = jobs.filter(job => job.publish_readiness === 'pilot_approved');
  const completedJobs = jobs.filter(job => job.publish_readiness === 'locked');
  const requestedUnavailable = Boolean(requestedJob) && !eligibleJobs.some(job => job.id === requestedJob);
  const selectedJob = requestedUnavailable ? '' : requestedJob || eligibleJobs[0]?.id || '';
  const selected = eligibleJobs.find(job => job.id === selectedJob);
  const preview = selected ? `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><style>body{font-family:Arial,sans-serif;line-height:1.65;color:#111827;max-width:800px;margin:24px auto;padding:0 20px}h1{line-height:1.2}h2{margin-top:36px}img{max-width:100%;height:auto}figure{margin:28px 0}figcaption{font-size:14px;color:#475569}table{border-collapse:collapse;font-size:14px}th,td{border:1px solid #d1d5db;padding:9px;text-align:left}a{color:#1d4ed8}</style></head><body><h1>${selected.title.replaceAll('&','&amp;').replaceAll('<','&lt;')}</h1>${loadBody(selected)}</body></html>` : '';

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
      {requestedUnavailable ? <p role="status" style={{padding:14,background:'#fffbeb'}}>This job is completed or unavailable for approval. Select a current draft below. No other article has been selected in its place.</p> : null}
      {eligibleJobs.length ? <form method="post" action="/api/shopify/start">
          <label htmlFor="job"><strong>Ready for approval</strong></label><br/>
          <select id="job" name="job" defaultValue={selectedJob} required style={{width:'100%',padding:10,margin:'6px 0 14px'}}>
            {!selectedJob ? <option value="" disabled>Select a current draft</option> : null}
            {eligibleJobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <p style={{margin:'0 0 14px'}}>Review the draft below, then continue to the final publishing checks. This step does not publish.</p>
          <button type="submit" style={{padding:'12px 18px',background:'#111827',color:'#fff',border:0,borderRadius:7,fontWeight:700}}>Authorize Shopify &amp; prepare final approval</button>
        </form>
        : <p style={{margin:0,padding:'12px 14px',background:'#f8fafc',borderRadius:7}}><strong>No jobs are ready for publishing approval.</strong></p>}

      {completedJobs.length ? <details style={{marginTop:18}}>
        <summary><strong>Completed and locked ({completedJobs.length})</strong></summary>
        <ul>{completedJobs.map(job => <li key={job.id}>{job.title}</li>)}</ul>
      </details> : null}
    </section>


    {selected ? <section style={{border:'1px solid #d1d5db',borderRadius:10,padding:20,margin:'22px 0'}}>
      <h2>Review draft: {selected.title}</h2>
      <p><strong>Draft saved in Shopify. Publication requires your final approval.</strong></p>
      <img src={selected.cover_image.url} alt={selected.cover_image.alt} style={{width:'100%',maxWidth:800,aspectRatio:'16/9',objectFit:'cover',borderRadius:8}} />
      <dl><dt><strong>SEO title</strong></dt><dd>{selected.seo_title}</dd><dt><strong>Meta description</strong></dt><dd>{selected.meta_description}</dd></dl>
      <iframe title={`Full draft preview: ${selected.title}`} sandbox="" srcDoc={preview} style={{width:'100%',height:1100,border:'1px solid #d1d5db',borderRadius:8,background:'#fff'}} />
    </section> : null}

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
