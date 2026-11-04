import dirt from '../../data/nov-04-01-g300-vs-x2-vs-falcon.js';
import apartments from '../../data/nov-04-02-apartment-rv-guide.js';
import urtopia from '../../data/nov-04-03-urtopia-fold-comparison.js';
import storage from '../../data/nov-04-04-folding-fit-storage.js';

export const dynamic='force-dynamic';
export const metadata={title:'WattWheelz SEO — November 4 Editorial Review',robots:{index:false,follow:false}};

const articles=[dirt,apartments,urtopia,storage];
const modelPictures={
 'happyrun-electric-dirt-bike-g300-pro':'https://wattwheelz.com/cdn/shop/files/happyrun-g300pro-electric-dirt-bike_3.jpg?v=1770748287&width=1200',
 'freego-x2-pro-all-terrain-off-road-motorcycle-electric-dirt-bike-with-pedals':'https://wattwheelz.com/cdn/shop/files/X2-pro-All-terrain-Motorcycle.jpg?v=1771295704&width=1200',
 '79bike-falcon-pro':'https://wattwheelz.com/cdn/shop/files/DSC00124.jpg?v=1776249500&width=1200',
 'carbon-fold':'https://wattwheelz.com/cdn/shop/files/fold2.jpg?v=1771907318&width=1200',
 'urtopia-carbon-fold-step-thru-ebike':'https://wattwheelz.com/cdn/shop/files/cfb.webp?v=1771910791&width=1200',
 'urtopia-carbon-fold-2-e-bike':'https://wattwheelz.com/cdn/shop/files/blue16_12ee6476-bee1-45f9-a611-6c675e0e2f9f.png?v=1790467844&width=1200',
 'mooncool-pop-folding-electric-bike':'https://wattwheelz.com/cdn/shop/files/mooncool-pop-vibrant-orange-1.png?v=1789045303&width=1200'
};
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
function previewBody(job){
 const byId=new Map((job.image_plan||[]).map(p=>[p[0]+':'+p[1],p]));
 return String(job.body).replace(/<!-- IMAGE:([^:]+):(\d+) -->/g,(_,handle,index)=>{
  const p=byId.get(handle+':'+index);
  const url=modelPictures[handle];
  if(!p||!url)return '<div class="art-missing">Official Shopify image awaits product verification</div>';
  return '<figure><img src="'+escapeHtml(url)+'" alt="'+escapeHtml(p[2])+'" loading="lazy"/><figcaption>'+escapeHtml(p[3])+'</figcaption></figure>';
 });
}
const groups=[{name:'Adult electric dirt bikes',value:0},{name:'Folding / apartment and RV',value:1},{name:'Urtopia folding comparison',value:2},{name:'Storage fit / ownership',value:3}];
export default async function Review({searchParams}){
 const params=await searchParams;
 const index=Number.parseInt(params?.article||'0',10);
 const active=Number.isInteger(index)&&index>=0&&index<articles.length?index:0;
 const job=articles[active];
 const html=previewBody(job);
 const style={
  page:{maxWidth:1100,margin:'32px auto',padding:'0 20px 56px',fontFamily:'Inter,system-ui,sans-serif',color:'#142337',lineHeight:1.6},
  header:{background:'#111e30',color:'#fff',padding:'24px 28px',borderRadius:16},
  tabs:{display:'flex',flexWrap:'wrap',gap:8,margin:'18px 0 22px'},
  tab:{padding:'9px 13px',borderRadius:999,textDecoration:'none',fontWeight:650,border:'1px solid #c8d5e2',color:'#263f59'},
  active:{background:'#1d4f76',borderColor:'#1d4f76',color:'#fff'},
  article:{background:'#fff',border:'1px solid #cbd5e1',padding:'26px',borderRadius:16},
  note:{background:'#f3f6fa',padding:14,borderRadius:12,fontSize:14},
  pill:{display:'inline-block',fontSize:12,margin:'0 6px 6px 0',padding:'4px 8px',background:'#eef3f7',borderRadius:12,color:'#38516e'}
 };
 return <main style={style.page}>
 <header style={style.header}><div style={{letterSpacing:1,fontSize:13,color:'#b8d8f0',fontWeight:700}}>WATTWHEELZ · SEO CONTENT REVIEW</div>
  <h1 style={{fontSize:28,lineHeight:1.2,margin:'8px 0'}}>November 4 Performance Max Buyer Education</h1>
  <p style={{marginBottom:0,color:'#d7e8f3'}}>Read-only editorial preview. These are source drafts, not published storefront articles. Shopify image, product status, and internal-link checks still run in the existing controlled Stage 02/03 workflow.</p></header>
 <nav aria-label="Choose article preview" style={style.tabs}>{groups.map(({name,value})=><a key={value} href={'/pmax-review?article='+value} style={{...style.tab,...(value===active?style.active:{})}}>{value+1}. {name}</a>)}</nav>
 <section style={style.article}>
 <div style={{color:'#56728b',fontSize:13,fontWeight:700}}>ARTICLE {active+1} OF 4 · {job.manifest.blog_title}</div>
 <h2 style={{fontSize:29,lineHeight:1.2,margin:'8px 0 6px'}}>{job.manifest.title}</h2>
 <p style={{margin:'8px 0 20px',color:'#47627c'}}>{job.manifest.excerpt}</p>
 <div style={{...style.note,marginBottom:20}}>
 <div><strong>SEO title:</strong> {job.manifest.seo_title}</div>
 <div><strong>Meta description:</strong> {job.manifest.meta_description}</div>
 <div style={{marginTop:8}}><strong>Target URL (after approval):</strong> https://wattwheelz.com/blogs/{job.manifest.blog_handle}/{job.manifest.handle}</div>
 <div style={{marginTop:8}}><strong>Product image slots:</strong> {job.image_plan.length} from live catalog references</div>
 </div>
 <div className="wwArticlePreview" dangerouslySetInnerHTML={{__html:html}}/>
 </section>
 <aside style={{...style.note,marginTop:22}}>
  <strong>Production status:</strong> Editorial source preflight completed. The four files still require authenticated WattWheelz Shopify creation, live product/media/link validation, 16:9 cover QA and individual Stage 03 approval before publishing.
  <p style={{margin:'8px 0 0'}}>Open <a href="https://wattwheelz-seo-draft-generator-info-19821198.vercel.app/">Stage 02 Draft Generator</a> or <a href="https://wattwheelz-shopify-content-ops-info-19821198.vercel.app/">Stage 03 Publishing Control</a>.</p>
 </aside>
 <style>{`
  .wwArticlePreview h2{font-size:23px;line-height:1.3;margin:34px 0 10px;color:#162f45}
  .wwArticlePreview h3{font-size:17px;margin:17px 0 4px}
  .wwArticlePreview p{margin:10px 0 16px;font-size:16px}
  .wwArticlePreview a{color:#165d98;text-decoration:underline;text-underline-offset:2px}
  .wwArticlePreview ul{padding-left:22px}
  .wwArticlePreview figure{margin:24px 0;background:#f7f9fa;border:1px solid #dfe7ef;border-radius:12px;padding:12px}
  .wwArticlePreview img{display:block;width:100%;max-height:480px;object-fit:contain}
  .wwArticlePreview figcaption{font-size:13px;color:#5d7387;margin-top:8px}
  .wwArticlePreview table{width:100%;border-collapse:collapse;font-size:13px;margin:18px 0;display:block;overflow-x:auto;white-space:normal}
  .wwArticlePreview th,.wwArticlePreview td{border:1px solid #d4dfeb;padding:10px;text-align:left;vertical-align:top}
  .wwArticlePreview th{background:#eff5fa}
 `}</style>
 </main>;
}
