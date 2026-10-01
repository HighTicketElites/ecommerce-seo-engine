const envStatus={SHOPIFY_SHOP:Boolean(process.env.SHOPIFY_SHOP),SHOPIFY_CLIENT_ID:Boolean(process.env.SHOPIFY_CLIENT_ID),SHOPIFY_CLIENT_SECRET:Boolean(process.env.SHOPIFY_CLIENT_SECRET)};
export default function Home(){
 const ready=Object.values(envStatus).every(Boolean);
 return <main style={{fontFamily:'system-ui',maxWidth:900,margin:'50px auto',padding:24,lineHeight:1.55}}>
  <h1>WattWheelz SEO Draft Generator v1.7</h1>
  <p><b>Draft only.</b> Shopify OAuth + enhanced SEO/AEO QA.</p>
  <p><strong>Current job:</strong> How Much Does a Powered Exoskeleton Cost in 2026?</p>
  <p><strong>SEO/AEO angle:</strong> powered exoskeleton cost, exoskeleton price, H Pro vs H Ultra pricing, battery/ownership costs and consumer vs medical exoskeleton pricing.</p>
  <p><strong>Internal-link standard:</strong> minimum 3 product links, 2 collection links, 4 related-blog links, 9 total contextual internal links.</p>
  <pre>{JSON.stringify(envStatus,null,2)}</pre>
  {ready?<p><a href="/api/shopify/install" style={{display:'inline-block',padding:'14px 20px',background:'#111827',color:'#fff',textDecoration:'none',borderRadius:8,fontWeight:700}}>Authorize & Create / Update Exoskeleton Cost Draft</a></p>:<p><strong>NOT READY</strong></p>}
  <p style={{fontSize:14,color:'#4b5563'}}>Successful output remains unpublished for manual review.</p>
 </main>;
}