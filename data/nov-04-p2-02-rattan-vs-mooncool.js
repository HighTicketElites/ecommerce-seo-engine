import {C,P,B,a,render,makeManifest} from './nov-04-pmax-format.js';
const LM="rattan-lm-ultra",POP="mooncool-pop-folding-electric-bike",ST="urtopia-carbon-fold-step-thru-ebike";
const LMURL="https://wattwheelz.com/products/rattan-lm-ultra";
const MREVIEW="https://wattwheelz.com/blogs/e-bike-reviews-comparisons/mooncool-pop-folding-electric-bike-review-2026";
const sections=[
 {title:"Quick verdict: LM Ultra for battery capacity, POP for manageable utility",paragraphs:[
 "If you can roll your bike into ground-level storage and expect long recreational routes or high-payload riding, the "+a(LMURL,"Rattan LM Ultra")+" makes a compelling case through its unusually large 1,944Wh battery and 397-pound manufacturer-listed payload. If you prefer a more compact everyday folding design with suspension, integrated cargo rack and roughly 19 pounds less complete bike weight, the "+a(P.pop,"Mooncool POP")+" may solve the right problem.",
 "Both bikes are significantly heavier than the Urtopia carbon folders. Neither is the first recommendation for someone regularly carrying a bike up multiple flights. For that priority, compare a "+a(P.foldst,"Carbon Fold Step-Thru")+". This guide focuses on the meaningful difference between two utility-oriented folding bikes rather than pretending every folder serves the same rider." ],image:[LM,0]},
 {title:"Published comparison: battery, weight, power and folded size",paragraphs:[
 "The Rattan's 48V 40.5Ah battery contains about 1,944 nominal watt-hours; Mooncool's 48V 13.6Ah pack contains approximately 652.8Wh. Both use 48V systems, yet their storage capacities differ by almost threefold because amp-hour ratings differ. Watt-hours are not a guarantee of proportional real-world mileage.",
 "Manufacturer range tests and speed modes are not directly comparable. The Mooncool 40-mile low-PAS figure and Rattan 120-mile maximum should be treated as claims under different conditions. The practical difference for most buyers is whether the higher stored energy and weight will actually be useful." ],
 table:'<table><thead><tr><th>Specification</th><th>Rattan LM Ultra</th><th>Mooncool POP</th></tr></thead><tbody><tr><td>Rated/peak motor</td><td>1000W / 1800W</td><td>750W / 1200W</td></tr><tr><td>Battery energy</td><td>48V 40.5Ah / 1,944Wh</td><td>48V 13.6Ah / 652.8Wh</td></tr><tr><td>Full-bike weight</td><td>~86 lb (64 bike + 22 battery)</td><td>67 lb</td></tr><tr><td>Folded size</td><td>38.2 × 18 × 33.5 in</td><td>34.7 × 16.9 × 29.5 in</td></tr><tr><td>Published maximum range</td><td>Up to 120 mi</td><td>Up to 40 mi low PAS</td></tr><tr><td>Tires</td><td>20 × 4.0 in</td><td>20 × 3.0 in</td></tr><tr><td>Maximum load</td><td>~397 lb</td><td>330 lb</td></tr><tr><td>Manufacturer speed</td><td>Up to 28 mph</td><td>20 mph default, adjustable where lawful</td></tr></tbody></table>'},
 {title:"Why the Rattan has so much more battery",paragraphs:[
 "Battery energy can be computed by multiplying nominal volts by amp-hours. Rattan's 48 × 40.5 equals 1,944Wh, while POP's 48 × 13.6 equals 652.8Wh. The Rattan has roughly 2.98 times the nominal energy capacity of the POP. That makes it attractive for longer distances or frequent higher-assist use, but does not promise three times the actual range on the same route.",
 "A high-demand motor, fat tires, steep grades, wind and carried weight all change consumption. A heavier e-bike will require more effort to maneuver or transport. When reading both manufacturer range claims, separate optimistic pedal-assist testing from how you intend to use the throttle and actual motor output." ]},
 {title:"The lifting penalty: 86 pounds versus 67 pounds",paragraphs:[
 "WattWheelz specifies the LM Ultra's body at around 64 pounds, with a removable battery weighing another 22 pounds. It is important not to present the body-only figure as whole-bike ready-to-ride weight. With the battery installed the machine weighs about 86 pounds. POP's published complete bike weight is around 67 pounds.",
 "That difference matters more when moving the bike through a narrow threshold than while casually reading product cards. If you must hoist it into an SUV or carry it upstairs, practice the lift path safely and consider an appropriate loading aid. Folding helps dimensions, not necessarily body mechanics. Neither model should be called lightweight." ],image:[POP,0]},
 {title:"Folded size: compare the actual storage opening",paragraphs:[
 "The POP folds to approximately 34.7 × 16.9 × 29.5 inches. LM Ultra lists around 38.2 × 18 × 33.5 inches. The four-inch height difference can matter for an RV storage hatch, while the longer Rattan package may be awkward in a sedan trunk. You cannot predict fit from cargo volume alone.",
 "Measure the narrowest entry opening, the final available height and depth, and the angle needed to insert the bike. A very full cargo area may need accessories removed or repositioned according to the owner's manual. Our "+a(B.storage,"vehicle and apartment folding-fit guide")+" explains the measurement sequence step by step." ]},
 {title:"Motor delivery and climbing characteristics",paragraphs:[
 "Rattan lists a 1,000W sustained geared rear hub system with 1,800W advertised peak output and five levels of pedal assist. Mooncool lists 750W rated, 1,200W peak and an 85Nm published torque number. Those figures do not translate into a controlled climbing race because controller tuning, tire grip, rider mass and power delivery affect feel.",
 "For hilly mixed-surface commutes, prioritize a comfortable gearing range, tire traction and manageable weight. An extremely high motor output does not replace riding skill or appropriate braking. Both should be evaluated as relatively substantial folding utility e-bikes rather than lightweight sport bicycles." ]},
 {title:"Tire size and pavement comfort",paragraphs:[
 "The Rattan uses broad 20 × 4.0-inch CST tires while the POP uses 20 × 3.0-inch tires. A wider tire can be useful over rough or loose surfaces at the correct pressure, but may increase rolling drag and require more storage clearance. POP uses front and rear suspension and can offer comfort on uneven urban pavement, depending on setup and rider weight.",
 "Do not assume either folder is a dedicated technical mountain bike. Tires, suspension maintenance and terrain limits should follow the manufacturer. For ordinary city use, the narrower POP footprint may be more convenient to roll into a building or maneuver through crowded parking areas." ]},
 {title:"Brakes and loaded riding: more than a peak-watt score",paragraphs:[
 "Rattan specifies hydraulic discs with 180mm rotors. Mooncool also uses hydraulic disc brakes with 180mm front and rear rotors. A loaded 86-pound bike and an unloaded 67-pound bike will not necessarily feel the same when braking downhill. The condition of pads, rotor alignment, tire pressure and rider technique are critical.",
 "If you regularly haul bags or use a rack, observe the manufacturer limits for the bike and for each attachment independently. A rack rated for a specific cargo weight does not change the bike's total maximum load. Passenger use, if marketed, should only occur when the exact bike hardware is rated and allowed in the riding jurisdiction." ]},
 {title:"Carrying packages and daily errands",paragraphs:[
 "Mooncool publishes an integrated rear rack capacity of 120 pounds, though you still must honor the bike's total load limit. That gives the POP a practical errand-oriented role. Rattan markets a broader utility package including backrest and footrest equipment on certain LM Ultra configurations; those accessories may vary by selection and local restrictions.",
 "Select accessories after checking what is actually included at checkout. Avoid assuming all promotional bundles ship with every model. For daily groceries, commuting equipment and recreational gear, reliability, stable loading and easy parking often matter more than the size of the battery alone." ]},
 {title:"Charging, removable batteries and life with a bigger pack",paragraphs:[
 "The LM Ultra's 1,944Wh battery is much bigger than the POP's 652.8Wh battery. Rattan lists approximately eight to nine hours on its standard 4A charger; Mooncool lists approximately seven hours. Those are manufacturer estimates, not a promise of identical conditions or a guarantee if temperature or battery-management settings differ.",
 "Charge only with the approved charger, in a dry ventilated area, without obstructing an exit. Follow the exact battery manufacturer's storage limits, especially inside a hot RV or parked vehicle. Lithium-ion packs should not be charged while sleeping or unattended. For maintenance and storage planning, review "+a(B.battery,"our battery-care guide")+"." ]},
 {title:"Is the higher published Rattan range worth the extra mass?",paragraphs:[
 "That depends on your real weekly schedule. If your normal trip is five to ten miles round trip and you charge at home, the POP's pack may already satisfy your need with less weight and easier storage. If you regularly ride much farther or use high assist for long recreational trips, the energy reserve of the LM Ultra is genuinely different.",
 "Write down your longest repeatable route and required backup reserve. Avoid buying an 86-pound folder simply because 120 miles is a striking headline. Plan around distance, terrain, rider load, temperature and charging access rather than maximizing a number in isolation." ]},
 {title:"When a Urtopia carbon folder makes more sense than either",paragraphs:[
 "The "+a(P.foldst,"Urtopia Carbon Fold Step-Thru")+" is a sensible third option if the biggest problem is stairs, mounting ease or compact handling. Its roughly 37.1-pound published complete-bike weight is dramatically lower than the POP or Rattan, although its 252Wh battery stores less energy than either of the higher-output alternatives.",
 "That is not a universal ranking. It is a reminder to start with your daily environment. A small-capacity, lightweight folder can be an excellent match for predictable urban distances, while an 86-pound high-capacity folder can be much better for a rider with ground-level storage and long routes." ],image:[ST,0]},
 {title:"Which one belongs in your RV or apartment?",paragraphs:[
 "For a small apartment that requires regular carrying, neither heavy folder is a first-choice solution; compare the carbon models. For an RV with easy ground-level storage and long riding routes, Rattan's capacity may make sense. For a ground-floor apartment or camper that needs comfort, a usable cargo rack and a comparatively smaller folding envelope, the Mooncool POP deserves attention.",
 "Start with the "+a(C.folding,"curated apartment/RV folding collection")+" or the "+a(C.foldingAll,"full folding-bike category")+". Both are useful, but the current manufacturer's full-bike weight, folded envelope and available options should determine what you buy." ]},
 {title:"A final buyer checklist before ordering",paragraphs:[
 "Compare the exact model's whole-bike weight, storage opening, rider fit, total payload, rear-rack rating, nominal battery watt-hours, charger requirements, speed configuration and local legal access. Then check each current item price and manufacturer warranty. Do not rely on older promotional promises or an unrelated model's accessories.",
 "Read the "+a(B.apartments,"apartments and RVs selection guide")+" for use-case planning and the "+a(MREVIEW,"Mooncool POP review")+" for model-specific details. WattWheelz can help confirm which configuration and delivery arrangement suits your actual storage setup." ]}
];
const faqs=[
 ["Is Rattan LM Ultra longer range than Mooncool POP?","Its 1,944Wh battery is much larger than POP's 652.8Wh battery. The companies' 120-mile and 40-mile maximum claims use different test conditions and should not be treated as standardized results."],
 ["Which one is lighter?","Mooncool POP is listed at about 67 pounds, compared with around 86 pounds for LM Ultra including its removable battery."],
 ["Can I carry a Rattan LM Ultra upstairs?","The battery-out body is listed near 64 pounds and the full bike near 86 pounds. Assess whether the actual lift is safe; many stairs buyers should consider a lighter bike."],
 ["Which folds smaller?","Mooncool POP publishes approximately 34.7 × 16.9 × 29.5 inches, less than the LM Ultra's approximate 38.2 × 18 × 33.5 inches."],
 ["Does the Rattan have a 1,000W or 1,800W motor?","Rattan reports around 1,000W sustained and up to 1,800W peak. Sustained and peak ratings describe different conditions."],
 ["Can I carry a child or passenger on either?","Never infer passenger permission from accessories alone. Confirm the exact manufacturer-rated equipment, total load, and applicable local laws first."],
 ["Does the Mooncool have suspension?","Yes. Manufacturer materials list a front suspension fork and rear coil-spring suspension."],
 ["Which model has the better brakes?","Both specify hydraulic disc brakes with 180mm rotors. Real stopping performance requires correct setup, tires, loads and maintenance."],
 ["Can these bikes be used legally on public roads?","Motor output, speed configuration and e-bike classifications differ by jurisdiction. Verify the selected bike and riding area's rules."],
 ["Where should I compare active offers?","Use the two current WattWheelz product pages for available variants, price, delivery terms and manufacturer warranty." ]];
const job={
 manifest:makeManifest({
 title:"Rattan LM Ultra vs Mooncool POP: Which Folding E-Bike Is Better for You?",
 handle:"rattan-lm-ultra-vs-mooncool-pop-folding-ebike",blog:"e-bike-reviews-comparisons",
 titleTag:"Rattan LM Ultra vs Mooncool POP: Weight & Range",
 description:"Compare Rattan LM Ultra vs Mooncool POP folding e-bikes by battery energy, full-bike weight, folded dimensions, speed, load capacity and RV storage fit.",
 excerpt:"A specification-first comparison of two utility folding e-bikes with very different battery capacity and loaded weight.",
 tags:["2026","Rattan LM Ultra","Mooncool POP","Folding E-Bike Comparison","RV E-Bikes"],
 links:[LMURL,P.pop,P.foldst,C.folding,C.foldingAll,B.apartments,B.storage,MREVIEW,B.battery],
 graph:{parent:[B.apartments],siblings:[MREVIEW],supporting:[B.storage,B.battery]},
 destinations:[C.folding,C.foldingAll,LMURL,P.pop],incoming:[B.apartments,MREVIEW],minimumWords:1400
 }),
 product_handles:[LM,POP,ST],featured_handle:LM,featured_alt:"Rattan LM Ultra high-capacity folding electric bike compared with Mooncool POP",
 image_plan:[[LM,0,"Rattan LM Ultra folding electric bike authentic catalog photo","Rattan LM Ultra long-range utility folding bike."],[LM,1,"Rattan LM Ultra alternative product image","Rattan LM Ultra folding frame details."],[POP,0,"Mooncool POP folding electric bike official photo","Mooncool POP comfort-oriented folding e-bike."],[ST,0,"Urtopia Carbon Fold Step-Thru product photo","Lightweight carbon folding alternative."]],
 body:render({intro:"Rattan LM Ultra and Mooncool POP both fold, use fat or wide tires, and appeal to riders who want a practical electric bike for everyday trips or travel. They are not interchangeable products. LM Ultra prioritizes large battery energy and payload; POP has a smaller folded envelope, lighter total weight and a different comfort package. This guide compares their published specifications and realistic ownership constraints without claiming to have performed an independent road test.",sections,faqs,sources:[
 [LMURL,"WattWheelz Rattan LM Ultra complete weight, storage and battery details"],
 ["https://rattanebike.com/pages/lf-ultra-technical-specifications","Rattan Ultra family manufacturer technical specification reference"],
 ["https://www.mooncool.com/pages/pop-specification","Mooncool POP manufacturer technical specifications"],
 [P.pop,"WattWheelz Mooncool POP current configurations"],
 [B.apartments,"WattWheelz apartments and RVs buyer guide"]
 ]})
};
export default job;