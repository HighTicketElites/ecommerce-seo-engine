import {C,P,B,a,render,makeManifest} from './nov-04-pmax-format.js';
const G="happyrun-electric-dirt-bike-g300-pro",N="freego-nova5-electric-dirt-bike",F="79bike-falcon-pro";
const NOVA="https://wattwheelz.com/products/freego-nova5-electric-dirt-bike";
const NEW3="https://wattwheelz.com/blogs/e-bike-reviews-comparisons/happyrun-g300-pro-vs-freego-x2-pro-vs-79bike-falcon-pro";
const sections=[
{title:"Quick verdict: G300 Pro for value, Nova 5 for the mid-drive platform",paragraphs:[
"The "+a(P.g300,"HappyRun G300 Pro")+" is the natural starting point for an adult rider who wants high-output 72V performance without committing to the more expensive mid-drive category. It uses a 3,000W rated rear hub drive with up to 6,500W advertised peak, a removable 72V 30Ah battery, and a published 136.8-pound bike weight.",
"The "+a(NOVA,"Freego Nova 5")+" is a more substantial off-road-focused mid-drive machine: 4,000W nominal, up to 8,000W peak, 72V 40Ah battery, forged aluminum-alloy frame and approximately 159-pound weight. If the drivetrain design, larger energy reserve and hardware package are what you want, those features may justify the higher price. The two models should not be chosen only by a claimed top speed."],image:[G,0]},
{title:"Published G300 Pro vs Nova 5 specifications at a glance",paragraphs:[
"These figures come from the current WattWheelz model listings and manufacturers' published product specifications. They are not independently measured laboratory results or guaranteed performance on the same test course. Always compare the base Nova 5 to the base G300 Pro; the Nova 5 Pro is a materially different variant with its own motor and speed claims.",
"Both use a 72V nominal battery system, but the pack size and drivetrain are different. Wh (watt-hours) gives more context than amp-hours alone: 72 × 30 = 2,160Wh on the G300 Pro versus 72 × 40 = 2,880Wh on the base Nova 5. Higher stored energy does not directly predict the same percentage increase in range when load, gearing and power use vary."],
table:'<table><thead><tr><th>Specification</th><th>HappyRun G300 Pro</th><th>Freego Nova 5 (base)</th></tr></thead><tbody><tr><td>Drive system</td><td>Rear hub motor</td><td>Mid-drive motor</td></tr><tr><td>Rated / peak output</td><td>3,000W / 6,500W</td><td>4,000W / 8,000W</td></tr><tr><td>Battery</td><td>72V 30Ah / ~2,160Wh</td><td>72V 40Ah / ~2,880Wh</td></tr><tr><td>Published top speed</td><td>Up to 50 mph</td><td>Up to 53 mph</td></tr><tr><td>Manufacturer range claim</td><td>Up to 70 miles</td><td>Approx. 40–70 miles</td></tr><tr><td>Bike weight</td><td>136.8 lb</td><td>About 159 lb</td></tr><tr><td>Published load</td><td>350 lb</td><td>About 264 lb</td></tr><tr><td>Front/rear brake rotor</td><td>180mm / 203mm</td><td>220mm / 200mm</td></tr></tbody></table>'},
{title:"Why hub drive versus mid-drive is a bigger difference than peak watts",paragraphs:[
"A hub motor drives the wheel directly through the rear wheel assembly. It has fewer bicycle-drivetrain power-transfer demands, but motor speed and wheel speed are linked. A mid-drive is positioned closer to the center of the bike and sends power through its final drive, with performance shaped by the motor, transmission configuration and controller. Not every e-moto mid-drive uses a normal bicycle chain and derailleur, so do not assume it shifts like a commuter e-bike.",
"The G300 Pro is a rear-hub system with single-speed gearing. Nova 5 is a higher-output mid-drive off-road platform. For some buyers, the mid-drive architecture and related suspension/brake package justify consideration more than a 3 mph headline speed advantage. For other buyers, those advantages are not relevant to the terrain they ride or their available budget." ]},
{title:"Battery energy: does 2,880Wh mean one-third more riding?",paragraphs:[
"The Nova 5 pack stores about 720Wh more nominal electrical energy than the G300 Pro's 2,160Wh pack—one-third more. That is a meaningful energy difference, but it does not guarantee one-third more distance. The Nova 5 may use more energy while accelerating or riding aggressively, and the machines do not share a verified real-world test protocol.",
"Both product pages use optimistic or broad published range language. The G300 Pro advertises up to 70 miles; Nova 5 around 40–70 miles depending on circumstances. Consider a route with climbs, soft soil and high throttle demand as a different task from gentle low-assist cruising. Protect a return-trip reserve rather than planning to use a full advertised maximum." ]},
{title:"HappyRun G300 Pro: why its value positioning matters",paragraphs:[
"The G300 Pro gives adult buyers 72V battery voltage, claimed 6,500W peak output, hydraulic brakes, an inverted front fork and 19-inch front/17-inch rear off-road motorcycle-style tires. It is not a lightweight commuter, yet its lower advertised purchase price can make the entry into high-output off-road riding less expensive than Nova 5.",
"The manufacturer lists a 31-inch seat height, rider-height guideline of 5 feet 4 inches to 6 feet 3 inches and 350-pound payload. Check the fit before ordering. For route planning, brake upkeep and ownership concerns, read our "+a(B.g300,"HappyRun G300 Pro review")+" and the "+a(B.dirt,"electric dirt bike buying guide")+"."],image:[G,1]},
{title:"Freego Nova 5: who benefits from the bigger chassis and powertrain",paragraphs:[
"The base Nova 5 uses a published 4,000W nominal/8,000W peak mid-drive, 72V 40Ah removable battery and a forged aluminum-alloy frame with front and rear hydraulic suspension. WattWheelz lists four-piston hydraulic disc brakes, approximately 210mm front travel and 78mm rear travel for the base configuration. The manufacturer-published weight is around 159 pounds.",
"The 159-pound chassis is roughly 22 pounds heavier than the G300 Pro, yet the Nova's published payload figure is lower, around 264 pounds. Bigger output is not the same as bigger carrying capacity. Prioritize riding fit, handling and the real route instead of judging these bikes by peak wattage. When shopping the "+a(NOVA,"Nova 5 product page")+", explicitly select the base 'Nova 5' model, not 'Nova 5 Pro', for this comparison."],image:[N,0]},
{title:"Nova 5 versus Nova 5 Pro: do not confuse the variants",paragraphs:[
"WattWheelz presents Nova 5 and Nova 5 Pro as selectable model options under the Nova product family. The base Nova 5 is listed at 4,000W nominal, 8,000W peak and approximately 53 mph; the Nova 5 Pro is advertised at materially higher power and up to around 62 mph in manufacturer comparisons. Those figures are not interchangeable.",
"A product page that displays a higher-priced Pro option should not be used to justify a recommendation for the base Nova 5. Check the model selection, battery type, current stock, motor rating and the actual cart line item before checkout. This guide focuses on the base Nova 5 only." ]},
{title:"Real off-road braking and suspension: what buyers should inspect",paragraphs:[
"Both bikes have hydraulic disc braking but the published rotor sizes differ. HappyRun lists 180mm front and 203mm rear. WattWheelz lists 220mm front and 200mm rear for the Nova 5, with four-piston calipers. Larger rotors can affect heat capacity and leverage, but braking distance also depends on tire grip, rider weight, terrain, mechanical condition and rider skill.",
"Nova 5 lists a front hydraulic fork with approximately 210mm travel, while the G300 Pro advertises an inverted suspension system and a vertical rear shock. Evaluate suspension adjustment, replacement parts and dealer support for your terrain. Manufacturer specification alone does not prove that one machine is faster or more comfortable on your particular trail." ]},
{title:"Handling and transport: neither bike is small",paragraphs:[
"The G300 Pro at 136.8 pounds is already far heavier than a typical pedal-assist e-bike. Nova 5 is heavier at around 159 pounds. Those weights make parking, transporting and recovering a dropped bike substantially different from moving a commuter bicycle. Choose a transport carrier and loading equipment rated for the actual machine.",
"The seat height and standover also matter. A person may fit the manufacturer's height range but still struggle to balance a heavy bike on sloped, uneven ground. Consider your strength, protective equipment, intended riding area and ability to load the model into a truck or trailer safely." ]},
{title:"Off-road legality: do not treat a high-power machine as a Class 2 bicycle",paragraphs:[
"Both machines advertise off-road speeds far above the commonly used assisted-speed limits for ordinary electric bicycles. Public-road and trail access depends on jurisdiction, motor classification, registration rules, land-manager policies and actual configuration. A manufacturer-assigned 'class' display setting does not automatically create legal permission to use every road or bicycle path.",
"Before buying, check whether the property or trail permits the exact vehicle type. If your primary purpose is a legal city commute, compare appropriately classified pedal-assist e-bikes instead of assuming you can operate an e-moto anywhere a bicycle is allowed." ]},
{title:"Maintenance and replacement-part planning",paragraphs:[
"The G300 Pro's hub-drive arrangement and the Nova 5's mid-drive design can lead to different service demands, including controllers, final drive components and specialized motorcycle-style tires. Both machines will consume brake pads and tire tread faster under hard riding, especially on abrasive terrain. Confirm availability of the exact replacement parts.",
"Large lithium-ion packs also deserve careful ownership planning. Use only the manufacturer-approved charger and follow storage and charging temperatures. Inspect brake lines, rotor condition, chain or final-drive hardware and tires regularly. Use "+a(B.battery,"our battery care guide")+" as a general starting point, but defer to the exact model manual on compatibility and service intervals." ]},
{title:"Who should buy each one?",paragraphs:[
"Choose G300 Pro first if you want a 72V adult electric dirt bike with a comparatively accessible purchase price, can handle its 136.8-pound weight, and are comfortable with a rear-hub system. Consider Nova 5 if you can justify a heavier 159-pound mid-drive machine and want the 2,880Wh pack, higher manufacturer output rating and its off-road component package.",
"If you are still unsure which performance tier is right, our "+a(NEW3,"three-bike G300 Pro versus Freego X2 Pro versus Falcon Pro comparison")+" adds a pedal-equipped and a premium alternative. Visit the "+a(C.dirt,"adult electric dirt bike collection")+" to check other current configurations without assuming one bike fits every rider." ]},
{title:"How to compare purchase value without being misled by promotions",paragraphs:[
"Compare the exact selected variant and final checkout total rather than screenshots of different sales events. Price, free-shipping eligibility, warranty coverage and financing disclosures may change. The G300 Pro and Nova 5 can serve different budgets, but a temporary discount cannot resolve whether you need the larger battery or a different powertrain.",
"Confirm that a lower displayed price is for the single machine you intend to buy, not a two-bike combo or a Pro configuration. Read each manufacturer's written warranty and return terms and ask WattWheelz for confirmation when a spec sheet conflicts with a product selector." ]},
{title:"A simple dirt-bike selection checklist",paragraphs:[
"Write down the precise terrain and legal access, your height and preferred seat feel, the weight you can move safely, the range you need with a return reserve, and the complete delivered cost. Then compare rear-hub versus mid-drive service support and whether the listed payload suits you and your equipment.",
"If the answers point to a lighter, less-expensive entry into adult 72V dirt bikes, inspect "+a(P.g300,"HappyRun G300 Pro")+". If your route justifies a heavier, more expensive mid-drive and bigger battery, inspect "+a(NOVA,"Freego Nova 5")+". If neither works, use the "+a(C.dirt,"adult electric dirt-bike buying collection")+" and "+a(C.dirtCanonical,"wider electric dirt bike selection")+" to compare alternatives." ]}
];
const faqs=[
 ["Is the Freego Nova 5 faster than HappyRun G300 Pro?","Manufacturer claims are up to around 53 mph for base Nova 5 and 50 mph for G300 Pro. These are not standardized independent tests or guaranteed results."],
 ["Which bike has the bigger battery?","Nova 5 has 72V 40Ah, approximately 2,880Wh, compared with 72V 30Ah or 2,160Wh for the G300 Pro."],
 ["Is the Nova 5 heavier?","Yes. Its published weight is around 159 pounds compared with 136.8 pounds for the G300 Pro."],
 ["Does 8,000W peak mean Nova 5 always accelerates faster?","No. Peak advertised wattage alone does not establish timed acceleration. Controller behavior, traction, load and riding conditions matter."],
 ["What is the difference between hub drive and mid-drive?","A hub motor drives the wheel at its axle. A mid-drive transfers power through a separate drive arrangement, potentially changing weight distribution and servicing."],
 ["Are either of these bikes legal on all public trails?","No. Their high-output specifications and local access rules must be checked for the exact vehicle and location."],
 ["Is the Freego Nova 5 Pro included in this comparison?","No. The Nova 5 Pro is a separate higher-output configuration. All referenced specs and judgments here apply to the base Nova 5."],
 ["Which has more payload capacity?","Published listings indicate approximately 350 pounds for G300 Pro versus around 264 pounds for base Nova 5. Verify the selected version."],
 ["Which is better for a first-time e-bike rider?","Both are very powerful and heavy; consider rider experience, legal environment, controllability, training, protective equipment and a lower-output alternative."],
 ["Where can I compare the current prices and stock?","Open the exact G300 Pro and Nova 5 WattWheelz product pages. Choose the intended model and color before assessing any offer." ]];
const job={
 manifest:makeManifest({
 title:"HappyRun G300 Pro vs Freego Nova 5: Which 72V Electric Dirt Bike Should You Buy?",
 handle:"happyrun-g300-pro-vs-freego-nova5-electric-dirt-bike",blog:"e-bike-reviews-comparisons",
 titleTag:"HappyRun G300 Pro vs Freego Nova 5: 72V Guide",
 description:"HappyRun G300 Pro vs Freego Nova 5: compare 72V battery energy, hub vs mid-drive, weight, brakes, range claims and off-road buyer fit before buying.",
 excerpt:"A 72V adult electric dirt bike comparison focused on value, drivetrain layout, battery energy, weight and actual rider priorities.",
 tags:["2026","HappyRun G300 Pro","Freego Nova 5","72V Electric Dirt Bikes","Electric Dirt Bike Comparison"],
 links:[C.dirt,C.dirtCanonical,P.g300,NOVA,P.falcon,B.dirt,B.volts,B.g300,B.battery,NEW3],
 graph:{parent:[B.dirt],siblings:[NEW3],supporting:[B.volts,B.g300]},
 destinations:[C.dirt,P.g300,NOVA],incoming:[B.dirt,NEW3],minimumWords:1400
 }),
 product_handles:[G,N,F],featured_handle:G,
 featured_alt:"HappyRun G300 Pro 72V electric dirt bike compared against the Freego Nova 5 mid-drive model",
 image_plan:[
 [G,0,"HappyRun G300 Pro high-output electric dirt bike current product image","HappyRun G300 Pro 72V hub-drive adult dirt bike."],
 [G,1,"HappyRun G300 Pro alternative current product photo","Additional official G300 Pro product view."],
 [N,0,"Freego Nova 5 mid-drive off-road electric bike official current product photo","Freego Nova 5 72V 40Ah mid-drive electric dirt bike."],
 [N,1,"Freego Nova 5 alternative current product photograph","Additional current Nova 5 catalog model view."]
 ],
 body:render({intro:"Comparing HappyRun G300 Pro and Freego Nova 5? Both belong in the high-output 72V adult electric dirt-bike category, but they solve different buyer problems. The G300 Pro is a lower-cost hub-drive route into high-output riding, while the base Nova 5 offers a larger 40Ah pack and more powerful mid-drive off-road package at greater weight. This guide focuses on published model facts, ownership tradeoffs and intended terrain—not invented firsthand ride testing.",sections,faqs,sources:[
 [P.g300,"WattWheelz HappyRun G300 Pro current full specifications"],
 [NOVA,"WattWheelz Freego Nova 5 base and Pro selector / published specifications"],
 ["https://happyrunbike.com/products/happyrun-g300-pro-6500w-electric-dirt-bike","HappyRun official G300 Pro specifications"],
 [B.dirt,"WattWheelz electric dirt bike buying guide"],
 [NEW3,"WattWheelz three-way high-output dirt-bike comparison"]
 ]})
};
export default job;