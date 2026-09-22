import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const banned=[/watt\s*wheelz/i,/wattwheelz/i,/ww_oauth/i,/happyrun/i,/g300/i,/RDT_SHOPIFY_/];
const allowedExt=new Set(['.js','.mjs','.json','.md','.html','.example']);
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.next'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(allowedExt.has(path.extname(entry.name))||entry.name==='.env.example')files.push(file)}}
walk(root);
const failures=[];
for(const file of files){
  if(path.relative(root,file)==='scripts/validate-package.mjs') continue;
  const text=fs.readFileSync(file,'utf8');
  for(const pattern of banned) if(pattern.test(text)) failures.push({file:path.relative(root,file),pattern:String(pattern)});
  if(/articleCreate\s*\(/.test(text)) failures.push({file:path.relative(root,file),pattern:'articleCreate'});
  if(/product(?:Create|Update|Set)\s*\(/.test(text)) failures.push({file:path.relative(root,file),pattern:'product mutation'});
  if(/articleUpdate\s*\(/.test(text) && path.relative(root,file)!=='lib/publish.js') failures.push({file:path.relative(root,file),pattern:'articleUpdate outside publishing module'});
}
const publishSource=fs.readFileSync(path.join(root,'lib','publish.js'),'utf8');
for(const required of ['articleFingerprint','pilot_approved','rolled_back_after_qa_failure','write_online_store_pages','isPublished,metafields']) if(!publishSource.includes(required)) failures.push({file:'lib/publish.js',pattern:`missing ${required}`});
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1)}
console.log(`Stage 03 isolation and mutation-boundary check passed across ${files.length} files.`);
