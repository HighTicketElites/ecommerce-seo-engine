import jobs from '../../data/nov-04-phase2-batch.js';

export const dynamic='force-dynamic';
export const metadata={title:'WattWheelz SEO — Phase 2 Editorial Review',robots:{index:false,follow:false}};
const productPages={
 'carbon-fold':'https://wattwheelz.com/products/carbon-fold',
 'urtopia-carbon-fold-step-thru-ebike':'https://wattwheelz.com/products/urtopia-carbon-fold-step-thru-ebike',
 'urtopia-carbon-fold-2-e-bike':'https://wattwheelz.com/products/urtopia-carbon-fold-2-e-bike',
 'mooncool-pop-folding-electric-bike':'https://wattwheelz.com/products/mooncool-pop-folding-electric-bike',
 'rattan-lm-ultra':'https://wattwheelz.com/products/rattan-lm-ultra',
 'happyrun-electric-dirt-bike-g300-pro':'https://wattwheelz.com/products/happyrun-electric-dirt-bike-g300-pro',
 'freego-nova5-electric-dirt-bike':'https://wattwheelz.com/products/freego-nova5-electric-dirt-bike',
 '79bike-falcon-pro':'https://wattwheelz.com/products/79bike-falcon-pro'
};
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderPreview(job){
 const plan=Object.fromEntries((job.image_plan||[]).map(p=>[p[0]+':'+p[1],p]));
 return job.body.replace(/<!-- IMAGE:([^:]+):(\d+) -->/g,(_,handle,index)=>{
  const p=plan[handle+':'+index];const url=productPages[handle];
  if(!p||!url)return '<p style="border:1px solid #eee;padding:12px">Authentic Shopify product image to be inserted after OAuth validation.</p>';
  return '<figure class="photo-slot"><a href="'+escapeHtml(url)+'" target="_blank" rel="noreferrer">Verify current manufacturer product image: '+escapeHtml(p[2])+'</a><figcaption>'+escapeHtml(p[3])+'</figcaption></figure>';
 });
}
export default async function Review({searchParams}){
 const p=await searchParams;const n=Number.parseInt(p?.article||'0',10);
 const selected=Number.isInteger(n)&&n>=0&&n<jobs.length?n:0;
 const job=jobs[selected],m=job.manifest;
 return <main style={{fontFamily:'system-ui,Arial,sans-serif',color:'#13263b',maxWidth:960,margin:'32px auto',padding:'0 20px 60px',lineHeight:1.7}}>
  <header style={{padding:'24px 28px',background:'#11253b',color:'white',borderRadius:14}}>
   <div style={{fontSize:13,letterSpacing:1,fontWeight:800}}>WATTWHEELZ · CONTROLLED SEO ENGINE</div>
   <h1 style={{fontSize:29,lineHeight:1.2,margin:'12px 0'}}>Performance Max Education — Phase 2</h1>
   <p style={{fontSize:14,color:'#d1e3f3',margin:0}}>Editorial source previews only. The actual Shopify drafts, exact images, active model status, internal URLs and 16:9 editorial cover are verified by Stage 02 / Stage 03 before publication.</p>
  </header>
  <nav style={{display:'flex',flexWrap:'wrap',gap:9,margin:'19px 0'}}>{jobs.map((j,i)=><a key={j.manifest.handle} href={'/pmax-phase2-review?article='+i} style={{fontSize:13,padding:'10px 12px',border:'1px solid #cad9e7',background:i===selected?'#1a567d':'white',color:i===selected?'white':'#15496c',textDecoration:'none',borderRadius:16,fontWeight:750}}>{i+1}. {j.manifest.title.length>48?j.manifest.title.slice(0,46)+'…':j.manifest.title}</a>)}</nav>
  <article style={{background:'#fff',border:'1px solid #cbd5e1',borderRadius:14,padding:'24px'}}>
   <small style={{color:'#53718a',fontWeight:700}}>{m.blog_title} · Draft source {selected+1} of {jobs.length}</small>
   <h2 style={{fontSize:27,lineHeight:1.25,margin:'10px 0 8px'}}>{m.title}</h2>
   <p style={{color:'#4b647a'}}>{m.excerpt}</p>
   <section style={{padding:15,background:'#f1f6fa',borderRadius:9,fontSize:14}}>
    <div><strong>SEO title:</strong> {m.seo_title}</div>
    <div><strong>Meta description:</strong> {m.meta_description}</div>
    <div><strong>Image slots:</strong> {job.image_plan.length}, pending actual Shopify media insertion</div>
   </section>
   <div className="ww-review-body" dangerouslySetInnerHTML={{__html:renderPreview(job)}}/>
  </article>
  <footer style={{padding:17,background:'#f1f6fa',marginTop:22,borderRadius:12,fontSize:14}}>
   <strong>Not published.</strong> These manuscripts passed source-content checks but have not passed the authenticated Shopify Draft QA.
   <p><a href="https://wattwheelz-seo-draft-generator-info-19821198.vercel.app/">Open Stage 02 draft generator</a> · <a href="https://wattwheelz-shopify-content-ops-info-19821198.vercel.app/">Stage 03 publishing review</a></p>
  </footer>
  <style>{`
   .ww-review-body h2{font-size:23px;margin-top:30px;line-height:1.25}
   .ww-review-body h3{font-size:17px;margin-top:20px}
   .ww-review-body p{margin:12px 0}
   .ww-review-body a{color:#165f92}
   .ww-review-body figure{padding:16px;background:#f4f7fa;border:1px solid #d4e0e9;border-radius:10px;margin:20px 0}
   .ww-review-body figcaption{font-size:13px;color:#577086;margin-top:8px}
   .ww-review-body table{display:block;overflow-x:auto;border-collapse:collapse;font-size:13px}
   .ww-review-body th,.ww-review-body td{border:1px solid #c7d4e0;padding:9px;text-align:left;vertical-align:top}
   .ww-review-body th{background:#eaf1f6}
  `}</style>
 </main>
}