import { listManifests } from '../lib/manifest.js';
const urls=[...new Set(listManifests().flatMap(m=>[...m.required_internal_links,...m.source_urls].filter(x=>new URL(x).hostname==='resideterra.com')))];
const results=[];let cursor=0;
async function worker(){while(cursor<urls.length){const url=urls[cursor++];try{const r=await fetch(url,{redirect:'follow',headers:{'User-Agent':'Resideterra-Stage02-Link-Verification/1.0'}});results.push({url,status:r.status,ok:r.ok,final_url:r.url})}catch(error){results.push({url,status:0,ok:false,error:error.message})}}}
await Promise.all(Array.from({length:8},worker));
results.sort((a,b)=>a.url.localeCompare(b.url));
const handles=[];
for(const manifest of listManifests()) for(const handle of manifest.product_handles) {
  const url=`https://resideterra.com/products/${encodeURIComponent(handle)}.js`;
  try {
    const response=await fetch(url,{redirect:'follow',headers:{'User-Agent':'Resideterra-Stage02-Handle-Verification/1.0'}});
    const product=response.ok?await response.json():null;
    handles.push({manifest:manifest.id,handle,status:response.status,ok:response.ok&&product?.handle===handle,returned_handle:product?.handle||null});
  } catch(error) { handles.push({manifest:manifest.id,handle,status:0,ok:false,error:error.message}); }
}
console.log(JSON.stringify({links:results,product_handles:handles},null,2));
if(results.some(x=>!x.ok)||handles.some(x=>!x.ok))process.exit(1);
