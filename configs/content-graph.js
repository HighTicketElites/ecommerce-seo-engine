const contentGraph={
  clusters:[
    {
      id:"exoskeleton-consumer",
      title:"Consumer Powered Exoskeletons",
      root:"powered-exoskeleton-cost-2026",
      roadmap_nodes:["powered-exoskeleton-cost-2026"],
      legacy_nodes:[
        "powered-exoskeleton-for-walking-ascentiz-h-pro-guide",
        "best-hiking-exoskeleton-ascentiz-h-ultra-vs-hypershell-dnsys"
      ],
      goal:"Own consumer exoskeleton category education and route shoppers into the Powered Exoskeletons collection and Ascentiz PDPs."
    },
    {
      id:"electric-dirt-performance",
      title:"Electric Dirt Bikes & High-Power Performance",
      root:"electric-dirt-bike-buying-guide-2026",
      roadmap_nodes:[
        "electric-dirt-bike-buying-guide-2026",
        "60v-vs-72v-electric-dirt-bikes",
        "79bike-falcon-pro-vs-talaria-sting-r-mx4",
        "750w-vs-1000w-ebikes",
        "dual-motor-vs-single-motor-ebikes",
        "ebike-torque-explained",
        "best-electric-dirt-bikes-adults-2027"
      ],
      goal:"Own high-power electric dirt bike discovery, technology comparison and BOF model-selection intent."
    },
    {
      id:"fat-tire-all-terrain",
      title:"Fat Tire, AWD & All-Terrain",
      root:"best-fat-tire-ebikes-2026",
      roadmap_nodes:[
        "best-fat-tire-ebikes-2026",
        "awd-vs-mid-drive-ebikes",
        "best-ebikes-for-hills-2026",
        "best-ebikes-snow-winter-2026-2027",
        "dual-motor-vs-single-motor-ebikes"
      ],
      goal:"Own terrain-driven buying intent across hills, snow, trails, traction and AWD."
    },
    {
      id:"utility-cargo-family",
      title:"Utility, Cargo & Family Mobility",
      root:"best-electric-utility-vehicles-2026",
      roadmap_nodes:[
        "eunorau-s1000-review-2026",
        "best-electric-utility-vehicles-2026",
        "best-cargo-ebikes-kids-gear-2026"
      ],
      goal:"Own utility and load-carrying searches and move shoppers into utility/cargo collections and products."
    },
    {
      id:"accessibility-fit",
      title:"Accessibility, Seniors, Fit & Easy Riding",
      root:"best-ebikes-seniors-easy-riding-2026",
      roadmap_nodes:[
        "best-ebikes-for-heavy-riders-2026",
        "best-ebikes-seniors-easy-riding-2026",
        "best-electric-trikes-adults-seniors-2026",
        "best-step-through-ebikes-2026",
        "ebike-size-rider-height-fit-guide"
      ],
      goal:"Own rider-fit, stability, access, payload and sizing searches with strong conversion support."
    },
    {
      id:"range-battery-ownership",
      title:"Range, Battery & Ownership",
      root:"real-world-ebike-range-explained",
      roadmap_nodes:[
        "best-long-range-ebikes-2026",
        "ebike-range-loss-cold-weather",
        "winter-ebike-battery-care",
        "real-world-ebike-range-explained",
        "how-long-ebike-batteries-last",
        "ebike-battery-replacement-cost",
        "annual-ebike-maintenance-cost"
      ],
      goal:"Own the battery/range/ownership question set and route informational traffic toward long-range and product pages."
    },
    {
      id:"budget-seasonal",
      title:"Budget, Deals & Holiday Buying",
      root:"best-ebikes-under-2000-2026",
      roadmap_nodes:[
        "best-black-friday-ebike-deals-2026",
        "best-ebikes-under-2000-2026",
        "best-ebikes-under-3000-2026",
        "best-electric-bike-gifts-2026"
      ],
      goal:"Capture high-conversion budget and Q4 seasonal purchase intent."
    },
    {
      id:"lightweight-folding-commuter",
      title:"Lightweight, Folding & Commuter",
      root:"best-lightweight-ebikes-2026",
      roadmap_nodes:[
        "best-lightweight-ebikes-2026",
        "best-folding-ebikes-2026",
        "best-ebikes-apartments-rvs-2026",
        "best-commuter-ebikes-2026",
        "carbon-fiber-ebikes-worth-it"
      ],
      goal:"Own portability, storage, commuting and lightweight/carbon buying intent."
    },
    {
      id:"hunting-awd",
      title:"Hunting & AWD",
      root:"eunorau-defender-s-2-hunter-x6-review-2026",
      roadmap_nodes:["eunorau-defender-s-2-hunter-x6-review-2026"],
      legacy_nodes:["best-electric-bikes-for-hunting-2026","hunting-in-stealth-the-rise-of-the-electric-dirt-bike"],
      goal:"Strengthen the existing hunting authority cluster with current-generation BOF content."
    },
    {
      id:"legal-classification",
      title:"Legal & E-Bike Classification",
      root:"class-1-vs-class-2-vs-class-3-ebikes",
      roadmap_nodes:["class-1-vs-class-2-vs-class-3-ebikes"],
      goal:"Own evergreen legal/classification education and support purchase confidence."
    },
    {
      id:"master-buying-2027",
      title:"Master E-Bike Buying Authority",
      root:"best-electric-bikes-2027",
      roadmap_nodes:["best-electric-bikes-2027","ebike-buying-guide-2027"],
      goal:"Create top-level 2027 authority hubs that distribute internal authority across all commercial clusters."
    }
  ],
  cross_cluster_edges:[
    ["electric-dirt-performance","fat-tire-all-terrain"],
    ["fat-tire-all-terrain","range-battery-ownership"],
    ["utility-cargo-family","accessibility-fit"],
    ["lightweight-folding-commuter","range-battery-ownership"],
    ["budget-seasonal","master-buying-2027"],
    ["legal-classification","master-buying-2027"]
  ]
};

export function graphNode(handle){
  const clusters=contentGraph.clusters.filter(c=>(c.roadmap_nodes||[]).includes(handle)||(c.legacy_nodes||[]).includes(handle));
  if(!clusters.length)return null;
  return{
    handle,
    clusters:clusters.map(c=>({id:c.id,title:c.title,root:c.root,goal:c.goal})),
    primary:clusters[0],
    is_root:clusters.some(c=>c.root===handle)
  };
}

export function relatedRoadmapHandles(handle){
  const node=graphNode(handle);
  if(!node)return[];
  const out=new Set();
  for(const c of contentGraph.clusters.filter(c=>node.clusters.some(n=>n.id===c.id))){
    for(const h of c.roadmap_nodes||[])if(h!==handle)out.add(h);
  }
  return[...out];
}

export default contentGraph;
