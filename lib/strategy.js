import contentArchitecture from '../configs/content-architecture.js';
import q4Roadmap from '../configs/q4-roadmap-2026.js';

export function roadmapEntry(handle){
  return q4Roadmap.find(x=>x.handle===handle)||null;
}
export function activeRoadmapEntry(){
  return q4Roadmap.find(x=>x.status==='active')||null;
}
export function nextRoadmapEntries(sequence,limit=5){
  return q4Roadmap.filter(x=>x.sequence>sequence).sort((a,b)=>a.sequence-b.sequence).slice(0,limit);
}
export function architectureNode(containerId,pillarId){
  const container=contentArchitecture.containers.find(x=>x.id===containerId);
  const pillar=container?.pillars?.find(x=>x.id===pillarId);
  return container&&pillar?{container,pillar}:null;
}
export function validateStrategy(manifest){
  const entry=roadmapEntry(manifest.handle);
  if(!entry)return{ok:false,reason:'No Q4 roadmap entry for article handle'};
  const node=architectureNode(entry.container,entry.pillar);
  if(!node)return{ok:false,reason:'Roadmap container/pillar does not exist in content architecture'};
  const destinations=manifest.commercial_destinations||entry.commercial_destinations||[];
  const incoming=manifest.incoming_link_targets||[];
  if(!destinations.length)return{ok:false,reason:'No commercial destination defined'};
  if(incoming.length<2)return{ok:false,reason:'At least 2 incoming-link targets are required before draft generation'};
  return{
    ok:true,
    entry,
    node,
    destinations,
    incoming,
    next:nextRoadmapEntries(entry.sequence,5)
  };
}
export {contentArchitecture,q4Roadmap};
