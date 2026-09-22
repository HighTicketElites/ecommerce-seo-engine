import { listManifests } from '../lib/manifest.js';
import { publicConfigStatus } from '../lib/config.js';

export const dynamic = 'force-dynamic';

export default function Home() {
  const jobs = listManifests();
  const eligibleJobs = jobs.filter(job => job.publish_readiness === 'pilot_approved');
  const completedJobs = jobs.filter(job => job.lock_reason === 'already_published_and_live_qa_passed');
  const status = publicConfigStatus();
  return <main style={{fontFamily:'Arial, sans-serif',maxWidth:980,margin:'48px auto',padding:24,lineHeight:1.55,color:'#111827'}}>
    <h1>Resideterra Controlled Publishing</h1>
    <p><strong>Human approval required.</strong> Preparing an approval does not publish. Every approval expires, binds to an exact content fingerprint, and is revalidated immediately before publication.</p>
    <section style={{border:'1px solid #d1d5db',borderRadius:10,padding:20,margin:'22px 0'}}>
      <h2>Environment readiness</h2>
      <pre style={{whiteSpace:'pre-wrap',background:'#f8fafc',padding:14}}>{JSON.stringify(status,null,2)}</pre>
    </section>
    <section style={{border:'1px solid #d1d5db',borderRadius:10,padding:20}}>
      <h2>Publishing jobs</h2>
      {eligibleJobs.length ? <form method="post" action="/api/shopify/start">
          <label htmlFor="job"><strong>Ready for approval</strong></label><br/>
          <select id="job" name="job" style={{width:'100%',padding:10,margin:'6px 0 14px'}}>
            {eligibleJobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <button type="submit" style={{padding:'12px 18px',background:'#111827',color:'#fff',border:0,borderRadius:7,fontWeight:700}}>Authorize and prepare publishing approval</button>
        </form>
        : <p style={{margin:0,padding:'12px 14px',background:'#f8fafc',borderRadius:7}}><strong>No jobs are ready for publishing approval.</strong> New jobs appear here only after draft QA, editorial-cover verification, and explicit Stage 03 approval.</p>}
      {completedJobs.length ? <details style={{marginTop:18}}>
        <summary><strong>Completed and locked ({completedJobs.length})</strong></summary>
        <ul>{completedJobs.map(job => <li key={job.id}>{job.title}</li>)}</ul>
      </details> : null}
    </section>
    <p style={{fontSize:14,color:'#4b5563'}}>Only approved draft jobs are selectable. Completed articles remain locked against replay, and failed live QA triggers an automatic return to draft.</p>
  </main>;
}
