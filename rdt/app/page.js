import manifest from '../data/manifest.js';

const envStatus={
  RDT_SHOPIFY_SHOP:Boolean(process.env.RDT_SHOPIFY_SHOP),
  RDT_SHOPIFY_CLIENT_ID:Boolean(process.env.RDT_SHOPIFY_CLIENT_ID),
  RDT_SHOPIFY_CLIENT_SECRET:Boolean(process.env.RDT_SHOPIFY_CLIENT_SECRET),
  RDT_APP_URL:Boolean(process.env.RDT_APP_URL),
  RDT_SESSION_SECRET:Boolean(process.env.RDT_SESSION_SECRET),
};

export default function Home(){
  const ready=Object.values(envStatus).every(Boolean);
  return <main style={{fontFamily:'system-ui',maxWidth:900,margin:'50px auto',padding:24,lineHeight:1.55}}>
    <h1>ResideTerra SEO Draft Generator</h1>
    <p><b>Draft only.</b> Git-backed production engine.</p>
    <p><strong>Current job:</strong> {manifest.title}</p>
    <pre style={{background:'#fff',padding:16,borderRadius:8}}>{JSON.stringify(envStatus,null,2)}</pre>
    {ready?
      <form method="post" action="/api/shopify/start">
        <button type="submit" style={{padding:'14px 20px',background:'#111827',color:'#fff',border:0,borderRadius:8,fontWeight:700,cursor:'pointer'}}>Create / Update Draft</button>
      </form>
      :<p><strong>NOT READY</strong></p>}
    <p style={{fontSize:14,color:'#4b5563'}}>No browser authorization is required. No publication mutation exists. A passing draft hands off to the separate controlled publishing plane.</p>
  </main>;
}
