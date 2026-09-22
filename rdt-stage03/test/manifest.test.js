import test from 'node:test';
import assert from 'node:assert/strict';
import { listManifests, validateManifest } from '../lib/manifest.js';

test('completed publications remain locked and fire-bowl comparison is publish-eligible',()=>{
  const jobs=listManifests();
  assert.equal(jobs.length,6);
  assert.deepEqual(jobs.filter(job=>job.publish_readiness==='pilot_approved').map(job=>job.id),['fire-bowl-vs-fire-water-bowl']);
  for(const id of ['modern-flames-landscape-vs-orion','fire-magic-echelon-vs-aurora-vs-choice','outdoor-plus-coronado-fire-pit-review','fire-water-bowls-for-pools']){
    assert.equal(jobs.find(job=>job.id===id).lock_reason,'already_published_and_live_qa_passed');
  }
  assert.equal(jobs.filter(job=>job.publish_readiness==='locked').length,5);
});

test('publish approval cannot bypass draft approval',()=>{
  const item=structuredClone(listManifests().find(job=>job.id==='fire-magic-echelon-vs-aurora-vs-choice'));
  item.draft_readiness='research_required';
  item.publish_readiness='pilot_approved';
  assert.throws(()=>validateManifest(item),/cannot be publish-approved/);
});
