const seoOSv2={
  version:"2.0",
  objective:"Turn WattWheelz organic search into a multi-lane demand-capture system that compounds authority into collections, PDPs and revenue.",
  workflow:[
    "01 Demand Discovery",
    "02 Opportunity Scoring",
    "03 Knowledge Graph Assignment",
    "04 SERP + Competitor Research",
    "05 Draft",
    "06 Content QA",
    "07 Commercial Routing QA",
    "08 Schema + Media QA",
    "09 Human Approval",
    "10 Controlled Publish",
    "11 Live QA",
    "12 Reciprocal Internal-Link Pass",
    "13 Indexation / Search Console Check",
    "14 Performance Feedback",
    "15 Refresh / Expansion"
  ],
  mandatory_gates:{
    demand_gate:{
      required:true,
      checks:["search lane assigned","entity assigned","intent assigned","search angle assigned","commercial destination defined","cannibalization checked"]
    },
    content_gate:{
      required:true,
      checks:["intent fully satisfied","original value present","fact verification complete","no unsupported specs","FAQ/AEO depth appropriate","sources included when claims require them"]
    },
    commercial_gate:{
      required:true,
      checks:["collection/PDP routes present","in-stock product fit verified","margin/inventory fit considered","no discontinued product promoted as current"]
    },
    graph_gate:{
      required:true,
      checks:["outgoing contextual links","minimum two incoming reciprocal-link targets","brand/category/product relationships assigned","cross-cluster links where useful"]
    },
    media_gate:{
      required:true,
      checks:["featured image","descriptive alt text","inline visuals","comparison/spec graphic opportunity checked","image search suitability checked"]
    },
    schema_gate:{
      required:true,
      checks:["page-type schema identified","breadcrumb eligibility checked","Article/Product/Review/VideoObject eligibility checked","schema validates before lock"]
    },
    publish_gate:{
      required:true,
      checks:["human approval","draft identity locked","controlled publish only","live URL 200","metadata retained","mobile rendering checked"]
    },
    feedback_gate:{
      required:true,
      checks:["Search Console query/page data","CTR opportunity","position 4-20 opportunity","organic conversions","cannibalization","decay/freshness","next-node recommendation"]
    }
  },
  weekly_mix:{
    rule:"Do not let the roadmap become dominated by one traffic lane.",
    target_slots:[
      {lane:"brand-authority / product-review / alternatives",share:"30-40%"},
      {lane:"category / use-case / price-value",share:"25-35%"},
      {lane:"technology / AEO / safety / ownership",share:"20-30%"},
      {lane:"refresh / expansion / reciprocal-link upgrades",share:"10-20%"}
    ]
  },
  production_rules:[
    "Prefer strengthening a position 4-20 page over publishing a weaker net-new node when Search Console shows the former has materially higher upside.",
    "Every strategic brand must have a hub before the brand is considered covered.",
    "Every strategic revenue SKU should eventually be supported by review, comparison, alternatives or use-case nodes.",
    "Every new article must create at least two opportunities for older relevant pages to link into it.",
    "Publishing does not complete a node; reciprocal linking, live QA, indexation and feedback are part of completion.",
    "Refresh beats replacement when the existing URL already owns meaningful impressions, links or rankings.",
    "Do not generate thin permutations merely to fill the entity x intent x angle matrix."
  ],
  next_system_builds:[
    "Search Console opportunity ingestion",
    "organic revenue attribution by landing page",
    "automatic reciprocal-link recommendation pass",
    "schema validator",
    "content freshness registry",
    "brand coverage dashboard",
    "strategic SKU coverage dashboard",
    "e-bike range calculator",
    "battery Wh / charging cost calculator",
    "fit / bike selector tool"
  ]
};
export default seoOSv2;
