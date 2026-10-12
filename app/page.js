const envStatus={SHOPIFY_SHOP:Boolean(process.env.SHOPIFY_SHOP),SHOPIFY_CLIENT_ID:Boolean(process.env.SHOPIFY_CLIENT_ID),SHOPIFY_CLIENT_SECRET:Boolean(process.env.SHOPIFY_CLIENT_SECRET)};
export default function Home(){
 const ready=Object.values(envStatus).every(Boolean);
 return <main style={{fontFamily:'system-ui',maxWidth:900,margin:'50px auto',padding:24,lineHeight:1.55}}>
  <h1>WattWheelz SEO Draft Generator v1.9</h1>
  <p><b>Draft only.</b> Shopify OAuth + enhanced SEO/AEO QA.</p>
  <p><strong>Current job:</strong> October 12 category + rider-intent batch.</p>
  <ol>
   <li>Best Fat Tire E-Bikes of 2026</li>
   <li>AWD vs Mid-Drive E-Bikes: Which Is Better for Hills, Snow & Trails?</li>
   <li>Best E-Bikes for Heavy Riders in 2026</li>
  </ol>
  <p><strong>Safety:</strong> each article is created or updated as an unpublished draft, independently QA-checked, and held for the separate Stage 03 human approval system.</p>
  <p><strong>QA:</strong> roadmap + content graph assignment, word depth, headings, FAQ depth, imagery, SEO metadata, commercial links, blog-to-blog relationships, and live internal-link checks.</p>
  <pre>{JSON.stringify(envStatus,null,2)}</pre>
  {ready?<p><a href="/api/shopify/install" style={{display:'inline-block',padding:'14px 20px',background:'#111827',color:'#fff',textDecoration:'none',borderRadius:8,fontWeight:700}}>Authorize & Create / Update 3 WattWheelz Drafts</a></p>:<p><strong>NOT READY</strong></p>}
  <section style={{marginTop:28,padding:18,border:'1px solid #d1d5db',borderRadius:10,background:'#f8fafc'}}>
    <strong>Next gate: Controlled Publishing</strong>
    <p style={{margin:'8px 0 14px'}}>This draft generator cannot publish. After draft QA passes, review and publish individual articles through Stage 03.</p>
    <a href="https://wattwheelz-shopify-content-ops.vercel.app/" style={{display:'inline-block',padding:'12px 18px',background:'#0f172a',color:'#fff',textDecoration:'none',borderRadius:8,fontWeight:700}}>Open WattWheelz Stage 03 Approval</a>
  </section>
  <p style={{fontSize:14,color:'#4b5563'}}>No article can be published by this generator. Publication requires a separate OAuth authorization, exact content fingerprint, final human click, and post-publish live QA.</p>
 </main>;
}
