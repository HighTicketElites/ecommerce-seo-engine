const envStatus={SHOPIFY_SHOP:Boolean(process.env.SHOPIFY_SHOP),SHOPIFY_CLIENT_ID:Boolean(process.env.SHOPIFY_CLIENT_ID),SHOPIFY_CLIENT_SECRET:Boolean(process.env.SHOPIFY_CLIENT_SECRET)};

const stage03Jobs=[
 {id:'best-fat-tire-ebikes-2026',title:'Best Fat Tire E-Bikes of 2026'},
 {id:'awd-vs-mid-drive-ebikes',title:'AWD vs Mid-Drive E-Bikes: Which Is Better for Hills, Snow & Trails?'},
 {id:'best-ebikes-for-heavy-riders-2026',title:'Best E-Bikes for Heavy Riders in 2026'},
];

const approvalBase='https://wattwheelz-shopify-content-ops.vercel.app/';

export default function Home(){
 const ready=Object.values(envStatus).every(Boolean);
 return <main style={{fontFamily:'system-ui',maxWidth:900,margin:'50px auto',padding:24,lineHeight:1.55}}>
  <h1>WattWheelz SEO Draft Generator v2.0</h1>
  <p><b>Controlled workflow.</b> Stage 02 creates and QA-checks unpublished Shopify drafts. Stage 03 handles final human approval, publication, live QA, and locking.</p>
  <p><strong>Current job:</strong> October 12 category + rider-intent batch.</p>
  <ol>
   <li>Best Fat Tire E-Bikes of 2026</li>
   <li>AWD vs Mid-Drive E-Bikes: Which Is Better for Hills, Snow & Trails?</li>
   <li>Best E-Bikes for Heavy Riders in 2026</li>
  </ol>
  <p><strong>Stage 02 QA:</strong> roadmap + content graph assignment, word depth, headings, FAQ depth, imagery, SEO metadata, commercial links, blog-to-blog relationships, and live internal-link checks.</p>
  <pre>{JSON.stringify(envStatus,null,2)}</pre>
  {ready?<p><a href="/api/shopify/install" style={{display:'inline-block',padding:'14px 20px',background:'#111827',color:'#fff',textDecoration:'none',borderRadius:8,fontWeight:700}}>Authorize & Create / Update 3 WattWheelz Drafts</a></p>:<p><strong>NOT READY</strong></p>}

  <section style={{marginTop:30,padding:22,border:'2px solid #111827',borderRadius:12,background:'#f8fafc'}}>
    <h2 style={{marginTop:0}}>Stage 03 — Approval & Publishing Control</h2>
    <p><strong>Nothing publishes from Stage 02.</strong> Once a draft passes QA, open it below. Stage 03 checks the live Shopify article state, active products, links, metadata, editorial cover, and exact content fingerprint before it will show the final Publish button.</p>
    <div style={{display:'grid',gap:10,margin:'16px 0'}}>
      {stage03Jobs.map(job=><a key={job.id} href={approvalBase+`?job=${encodeURIComponent(job.id)}`} style={{display:'block',padding:'12px 14px',border:'1px solid #cbd5e1',borderRadius:8,background:'#fff',color:'#0f172a',textDecoration:'none',fontWeight:700}}>
        Review in Stage 03 → {job.title}
      </a>)}
    </div>
    <a href={approvalBase} style={{display:'inline-block',padding:'12px 18px',background:'#0f172a',color:'#fff',textDecoration:'none',borderRadius:8,fontWeight:700}}>Open Full WattWheelz Publishing Dashboard</a>
  </section>

  <section style={{marginTop:22,padding:18,border:'1px solid #d1d5db',borderRadius:10}}>
    <h2 style={{marginTop:0}}>Locked operating sequence</h2>
    <p style={{marginBottom:0}}>Research → content graph / roadmap → Stage 02 draft → draft QA → Stage 03 controlled publishing → <strong>human approval</strong> → publish → live QA → lock → reciprocal/internal-link pass.</p>
  </section>

  <p style={{fontSize:14,color:'#4b5563'}}>Safety: the draft generator cannot publish. Stage 03 refuses already-live articles, changed drafts, inactive products, broken internal links, failed cover checks, or expired approvals. A critical live-QA failure after the final click triggers an automatic return to draft.</p>
 </main>;
}
