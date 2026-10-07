const searchDemandSystem={
  north_star:"Capture every commercially relevant way a high-value electric-mobility buyer can discover, compare, validate, purchase, own, or troubleshoot a product on WattWheelz.",
  dimensions:{
    entities:["category","brand","product","feature","competitor","rider","problem","location","season"],
    intents:["learn","discover","compare","validate","buy","own","troubleshoot"],
    angles:["best","review","vs","alternatives","how","why","cost","worth-it","for-x","under-price","specs","deals","model-year","safety","legal"],
    page_types:["blog","collection","brand-collection","pdp","comparison-landing","tool","evergreen-guide"]
  },
  lanes:[
    {id:"category-authority",priority:1,job:"Own head and mid-tail category discovery terms.",examples:["best electric dirt bikes","best fat tire e-bikes","best electric trikes"]},
    {id:"use-case",priority:1,job:"Capture rider, terrain, lifestyle and task-specific searches.",examples:["best e-bikes for hunting","best e-bikes for seniors","best e-bikes for hills"]},
    {id:"brand-authority",priority:1,job:"Build supplier entity authority from brand hub to model-level BOF content.",examples:["best Urtopia e-bikes","best HappyRun e-bikes","best EUNORAU e-bikes"]},
    {id:"product-review",priority:1,job:"Own exact-model commercial investigation and validation.",examples:["Urtopia Carbon 1 Pro review","HappyRun G300 Pro review","EUNORAU Defender S 2.0 review"]},
    {id:"model-comparison",priority:1,job:"Capture shoppers choosing between named models.",examples:["Falcon Pro vs Talaria Sting R MX4"]},
    {id:"alternatives",priority:1,job:"Intercept competitor demand and route it toward in-stock WattWheelz options.",examples:["Talaria alternatives","Sur Ron alternatives","Urtopia alternatives"]},
    {id:"brand-vs-brand",priority:2,job:"Capture brand-selection demand one layer above individual SKUs.",examples:["Urtopia vs Aventon","EUNORAU vs Bakcou","HappyRun vs Freego"]},
    {id:"technology-specs",priority:1,job:"Own specification and architecture questions that influence purchase fit.",examples:["60V vs 72V","hub vs mid-drive","dual motor vs single motor","how much torque do I need"]},
    {id:"price-value",priority:1,job:"Own budget, cost, value and ownership-economics queries.",examples:["best e-bikes under $2000","battery replacement cost","annual e-bike maintenance cost"]},
    {id:"problem-troubleshooting",priority:2,job:"Capture ownership problems and convert trust into future purchases, parts and referrals.",examples:["e-bike battery won't charge","e-bike range suddenly dropped","e-bike brakes squeaking"]},
    {id:"ownership",priority:2,job:"Own care, charging, storage, maintenance and lifecycle questions.",examples:["how to store an e-bike","winter battery care","how often to service an e-bike"]},
    {id:"safety-trust",priority:1,job:"Build purchase confidence around batteries, charging, certification and safe ownership.",examples:["UL 2849 explained","UL 2271 battery certification","is it safe to charge an e-bike overnight"]},
    {id:"legal-access",priority:2,job:"Capture classification, access and rules questions without overstating jurisdiction-specific law.",examples:["class 1 vs class 2 vs class 3","where can I ride an e-bike"]},
    {id:"seasonal",priority:2,job:"Capture time-sensitive Q4/Q1 demand and refresh it annually.",examples:["Black Friday e-bike deals","best e-bikes for winter","electric bike gifts"]},
    {id:"freshness-model-year",priority:1,job:"Continuously refresh model-year, discontinued-SKU and new-release content.",examples:["best electric bikes 2027","new Urtopia models","is Defender original discontinued"]},
    {id:"aeo-question",priority:1,job:"Win concise question-answer demand and AI retrieval while routing to commercial nodes.",examples:["how far can an e-bike go","what size e-bike do I need","how long do e-bike batteries last"]},
    {id:"interactive-tools",priority:1,job:"Create original utility assets that earn links, engagement and repeat organic visits.",examples:["e-bike range calculator","battery Wh calculator","e-bike fit calculator","e-bike comparison tool"]},
    {id:"commercial-page-seo",priority:1,job:"Optimize collection, brand collection and PDP pages as first-class organic landing pages.",examples:["electric dirt bike collection","Urtopia collection","Falcon Pro PDP"]},
    {id:"image-video-search",priority:2,job:"Capture Google Images, Lens and video-result demand with structured media assets.",examples:["comparison graphics","spec graphics","original product imagery","video chapters"]},
    {id:"offsite-authority",priority:1,job:"Earn supplier, dealer-directory, creator and editorial backlinks into strategic nodes.",examples:["authorized dealer directory","where to buy pages","creator reviews","digital PR assets"]}
  ],
  scoring:{
    scale:100,
    weights:{
      search_demand:20,
      commercial_intent:20,
      inventory_margin_fit:15,
      ranking_gap:15,
      topical_authority_gain:10,
      serp_weakness:10,
      freshness_urgency:5,
      linkability:5
    },
    rules:[
      "Do not prioritize search volume alone.",
      "Exact-model and alternatives demand may outrank larger informational terms when purchase intent is materially higher.",
      "Products that are discontinued, unavailable, low-margin, or strategically deprioritized receive a commercial-fit penalty.",
      "Existing impressions in positions 4-20 receive an opportunity boost once Search Console data is connected.",
      "Cannibalization risk must be checked before creating a new node."
    ]
  },
  reciprocal_linking:{
    required:true,
    minimum_incoming_targets:2,
    rule:"Every new node must link out contextually and identify older relevant pages that should link back into it after publication."
  },
  refresh_policy:{
    model_year_days:90,
    product_review_days:90,
    comparison_days:90,
    brand_hub_days:120,
    seasonal_days:30,
    pricing_days:30,
    legal_days:90,
    evergreen_technical_days:180,
    ownership_days:180,
    tools_days:90
  },
  feedback_loop:{
    sources:["Google Search Console","GA4","Shopify organic landing-page revenue","Merchant Center","keyword/SERP research"],
    weekly_actions:[
      "Find high-impression queries without a dedicated landing page.",
      "Find pages ranking positions 4-20 and strengthen them before creating net-new content.",
      "Find high-impression low-CTR pages and test title/meta/search-snippet alignment.",
      "Detect cannibalization between blogs, collections and PDPs.",
      "Detect content decay and product/spec/pricing changes.",
      "Promote organic landing pages that produce add-to-cart, checkout and revenue signals."
    ]
  }
};

export default searchDemandSystem;
