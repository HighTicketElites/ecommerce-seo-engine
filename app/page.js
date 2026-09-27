const envStatus={SHOPIFY_SHOP:Boolean(process.env.SHOPIFY_SHOP),SHOPIFY_CLIENT_ID:Boolean(process.env.SHOPIFY_CLIENT_ID),SHOPIFY_CLIENT_SECRET:Boolean(process.env.SHOPIFY_CLIENT_SECRET)};
export default function Home(){
 const ready=Object.values(envStatus).every(Boolean);
 return <main style={{fontFamily:'system-ui',maxWidth:900,margin:'50px auto',padding:24,lineHeight:1.55}}>
  <h1>WattWheelz SEO Draft Generator v1.4</h1>
  <p><b>Draft only.</b> Shopify OAuth + QA workflow.</p>
  <p><strong>Current job:</strong> Powered Exoskeleton for Walking — Ascentiz H Pro Buyer’s Guide (2026)</p>
  <p><strong>SEO/AEO angle:</strong> category-intent first; product as the answer. Targets powered exoskeleton for walking, hiking exoskeleton, consumer exoskeleton, cost, range, fit, H Pro vs H Ultra and non-medical buyer questions.</p>
  <pre>{JSON.stringify(envStatus,null,2)}</pre>
  {ready?<p><a href="/api/shopify/install" style={{display:'inline-block',padding:'14px 20px',background:'#111827',color:'#fff',textDecoration:'none',borderRadius:8,fontWeight:700}}>Authorize & Create / Update H Pro Draft</a></p>:<p><strong>NOT READY</strong></p>}
  <p style={{fontSize:14,color:'#4b5563'}}>No publication mutation exists. Successful output remains unpublished for manual review.</p>
 </main>;
}