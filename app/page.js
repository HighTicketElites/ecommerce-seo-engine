const envStatus = {
  SHOPIFY_SHOP: Boolean(process.env.SHOPIFY_SHOP),
  SHOPIFY_CLIENT_ID: Boolean(process.env.SHOPIFY_CLIENT_ID),
  SHOPIFY_CLIENT_SECRET: Boolean(process.env.SHOPIFY_CLIENT_SECRET),
};
export default function Home() {
  const ready = Object.values(envStatus).every(Boolean);
  return <main style={{fontFamily:'system-ui',maxWidth:900,margin:'50px auto',padding:24,lineHeight:1.55}}>
    <h1>WattWheelz SEO Draft Generator v1.3</h1>
    <p><b>Draft only.</b> Proven Shopify OAuth flow restored.</p>
    <p><strong>Current job:</strong> HOVSCO HovCart Review 2026</p>
    <pre>{JSON.stringify(envStatus,null,2)}</pre>
    {ready ? <p><a href="/api/shopify/install" style={{display:'inline-block',padding:'14px 20px',background:'#111827',color:'#fff',textDecoration:'none',borderRadius:8,fontWeight:700}}>Authorize & Create / Update HovCart Draft</a></p> : <p><strong>NOT READY</strong></p>}
    <p style={{fontSize:14,color:'#4b5563'}}>No publication mutation exists. Successful output remains unpublished and hands off to V4.</p>
  </main>;
}
