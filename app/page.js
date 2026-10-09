const envStatus={SHOPIFY_SHOP:Boolean(process.env.SHOPIFY_SHOP),SHOPIFY_CLIENT_ID:Boolean(process.env.SHOPIFY_CLIENT_ID),SHOPIFY_CLIENT_SECRET:Boolean(process.env.SHOPIFY_CLIENT_SECRET)};
export default function Home(){
 const ready=Object.values(envStatus).every(Boolean);
 return <main style={{fontFamily:'system-ui',maxWidth:900,margin:'50px auto',padding:24,lineHeight:1.55}}>
  <h1>WattWheelz SEO Draft Generator v1.8</h1>
  <p><b>Draft only.</b> Shopify OAuth + enhanced SEO/AEO QA.</p>
  <p><strong>Current job:</strong> Y-VOLT Surge V authority review.</p>
<ol>
 <li>Y-VOLT Surge V Review 2026: 35kW Power, 97.2V Battery, 68 MPH & Who It’s For</li>
</ol>
  <p><strong>Safety:</strong> each article is created or updated as an unpublished draft, independently QA-checked, and held for human approval before publication.</p>
  <p><strong>QA:</strong> roadmap + content graph assignment, word depth, headings, FAQ depth, imagery, SEO metadata, commercial links, blog-to-blog relationships, and live internal-link checks.</p>
  <pre>{JSON.stringify(envStatus,null,2)}</pre>
  {ready?<p><a href="/api/shopify/install" style={{display:'inline-block',padding:'14px 20px',background:'#111827',color:'#fff',textDecoration:'none',borderRadius:8,fontWeight:700}}>Authorize & Create / Update Y-VOLT Draft</a></p>:<p><strong>NOT READY</strong></p>}
  <p style={{fontSize:14,color:'#4b5563'}}>No article will be published by this generator.</p>
 </main>;
}