import { listManifests, loadBody } from '../lib/manifest.js';
import { countTag, extractInternalLinks } from '../lib/html.js';

const manifests=listManifests();
if(manifests.length!==6) throw new Error(`Expected six controlled manifests; found ${manifests.length}`);
for(const manifest of manifests){
  const body=loadBody(manifest);
  if(countTag(body,'h1')!==0) throw new Error(`${manifest.id} body contains H1`);
  for(const link of manifest.required_internal_links) if(!extractInternalLinks(body).includes(link)) throw new Error(`${manifest.id} body missing ${link}`);
  if(manifest.publish_readiness==='pilot_approved' && manifest.draft_readiness!=='approved') throw new Error(`${manifest.id} bypasses draft approval`);
  if(manifest.publish_readiness==='pilot_approved' && (!manifest.cover_image.url || manifest.cover_image.asset_kind!=='editorial_cover')) throw new Error(`${manifest.id} lacks an approved editorial cover`);
}
const eligible=manifests.filter(manifest=>manifest.publish_readiness==='pilot_approved').map(manifest=>manifest.id).sort();
const expectedEligible=['fire-bowl-vs-fire-water-bowl'];
if(JSON.stringify(eligible)!==JSON.stringify(expectedEligible)) throw new Error(`Unexpected publish-eligible jobs: ${eligible.join(', ')}`);
const completed=['modern-flames-landscape-vs-orion','fire-magic-echelon-vs-aurora-vs-choice','outdoor-plus-coronado-fire-pit-review','fire-water-bowls-for-pools'];
for(const id of completed){
  const published=manifests.find(manifest=>manifest.id===id);
  if(!published || published.publish_readiness!=='locked' || published.lock_reason!=='already_published_and_live_qa_passed') throw new Error(`${id} must remain locked after successful publication`);
}
console.log(`Validated ${manifests.length} manifests: four completed publications are locked and Fire Bowl vs Fire & Water Bowl is the only publish-eligible reviewed job.`);
