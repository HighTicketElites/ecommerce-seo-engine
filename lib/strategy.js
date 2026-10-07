import contentArchitecture from '../configs/content-architecture.js';
import q4Roadmap from '../configs/q4-roadmap-2026.js';
import contentGraph, { graphNode } from '../configs/content-graph.js';
import searchDemandSystem from '../configs/search-demand-system.js';

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
  const semantic=manifest.blog_link_graph||{};
  const parent=semantic.parent||[];
  const siblings=semantic.siblings||[];
  const supporting=semantic.supporting||[];
  const graph=graphNode(manifest.handle);
  if(!destinations.length)return{ok:false,reason:'No commercial destination defined'};
  if(incoming.length<2)return{ok:false,reason:'At least 2 incoming-link targets are required before draft generation'};
  if(!graph)return{ok:false,reason:'Article is not assigned to a semantic content graph cluster'};
  if((parent.length+siblings.length+supporting.length)<2)return{ok:false,reason:'At least 2 semantic blog relationships are required (parent/sibling/supporting)'};
  const allSemantic=[...parent,...siblings,...supporting];
  if(new Set(allSemantic).size!==allSemantic.length)return{ok:false,reason:'Semantic blog relationship URLs must be unique'};
  return{
    ok:true,
    entry,
    node,
    destinations,
    incoming,
    semantic:{parent,siblings,supporting,all:[...parent,...siblings,...supporting]},
    graph,
    next:nextRoadmapEntries(entry.sequence,5),
    search_lane:demandLane(entry.search_lane||manifest.search_lane||'')
  };
}
export {contentArchitecture,q4Roadmap,contentGraph,searchDemandSystem};


export function demandLane(id){
  return searchDemandSystem.lanes.find(x=>x.id===id)||null;
}

export function scoreOpportunity(input={}){
  const w=searchDemandSystem.scoring.weights;
  const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
  const components={
    search_demand:clamp(input.search_demand),
    commercial_intent:clamp(input.commercial_intent),
    inventory_margin_fit:clamp(input.inventory_margin_fit),
    ranking_gap:clamp(input.ranking_gap),
    topical_authority_gain:clamp(input.topical_authority_gain),
    serp_weakness:clamp(input.serp_weakness),
    freshness_urgency:clamp(input.freshness_urgency),
    linkability:clamp(input.linkability)
  };
  const score=Object.entries(w).reduce((sum,[k,weight])=>sum+(components[k]*(weight/100)),0);
  return{score:Math.round(score*10)/10,components,weights:w};
}

export function refreshWindowDays(pageType){
  return searchDemandSystem.refresh_policy[pageType]||null;
}
