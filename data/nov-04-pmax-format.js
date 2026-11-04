// November 4, 2026 collection-led buyer education batch (Stage 02 only).
// Publisher remains locked behind Stage 03 human approval.
export const WW="https://wattwheelz.com";
export const C={
 dirt:WW+"/collections/adult-electric-dirt-bike-picks",
 dirtCanonical:WW+"/collections/best-electric-dirt-bikes-for-adults",
 folding:WW+"/collections/folding-e-bike-shortlist-for-apartments-rvs",
 foldingCanonical:WW+"/collections/best-e-bikes-for-apartments-rvs",
 foldingAll:WW+"/collections/folding-e-bikes",
 urtopia:WW+"/collections/urtopia",
 brands79:WW+"/collections/79bike"
};
export const P={
 g300:WW+"/products/happyrun-electric-dirt-bike-g300-pro",
 x2:WW+"/products/freego-x2-pro-all-terrain-off-road-motorcycle-electric-dirt-bike-with-pedals",
 falcon:WW+"/products/79bike-falcon-pro",
 fold1:WW+"/products/carbon-fold",
 foldst:WW+"/products/urtopia-carbon-fold-step-thru-ebike",
 fold2:WW+"/products/urtopia-carbon-fold-2-e-bike",
 pop:WW+"/products/mooncool-pop-folding-electric-bike"
};
export const B={
 dirt:WW+"/blogs/e-bike-buying-guides/electric-dirt-bike-buying-guide-2026",
 volts:WW+"/blogs/e-bike-reviews-comparisons/60v-vs-72v-electric-dirt-bikes",
 g300:WW+"/blogs/e-bike-reviews-comparisons/happyrun-g300-pro-review-2026",
 falcon:WW+"/blogs/e-bike-reviews-comparisons/79bike-falcon-pro-vs-talaria-sting-r-mx4",
 urtopia:WW+"/blogs/e-bike-brand-guides/best-urtopia-electric-bikes-2026",
 versus:WW+"/blogs/e-bike-reviews-comparisons/urtopia-carbon-1-pro-vs-carbon-fold-step-thru",
 battery:WW+"/blogs/e-bike-tech-ownership/e-bike-battery-care-guide-2026",
 apartments:WW+"/blogs/e-bike-buying-guides/best-ebikes-apartments-rvs-2026",
 foldversus:WW+"/blogs/e-bike-reviews-comparisons/urtopia-carbon-fold-1-vs-step-thru-vs-fold-2",
 storage:WW+"/blogs/e-bike-rider-guides/will-a-folding-ebike-fit-rv-car-apartment"
};
export const a=(url,label)=>'<a href="'+url+'">'+label+'</a>';
export const photo=(handle,i=0)=>'<!-- IMAGE:'+handle+':'+i+' -->';
export function render({intro,sections,faqs,sources}){
 return '<p>'+intro+'</p>\n'+sections.map(s=>'<h2>'+s.title+'</h2>\n'+s.paragraphs.map(x=>'<p>'+x+'</p>').join('\n')+(s.table||'')+(s.list?'<ul>'+s.list.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'')+(s.image?'\n'+photo(s.image[0],s.image[1]||0):'')).join('\n')+
 '\n<h2>Frequently Asked Questions</h2>\n'+faqs.map(q=>'<h3>'+q[0]+'</h3><p>'+q[1]+'</p>').join('\n')+
 '\n<h2>Sources &amp; Verification</h2><p>Specifications and manufacturer range figures are published claims, not independent WattWheelz performance tests. Check the exact model, selected configuration, current price and stock on the product page before ordering.</p><ul>'+sources.map(s=>'<li><a href="'+s[0]+'" rel="noopener noreferrer">'+s[1]+'</a></li>').join('')+'</ul>';
}
export function makeManifest({title,handle,blog,titleTag,description,excerpt,tags,links,graph,destinations,incoming,minimumWords=1150}){
 return {title,handle,blog_title:blog==='e-bike-buying-guides'?'E-Bike Buying Guides':blog==='e-bike-reviews-comparisons'?'E-Bike Reviews & Comparisons':'E-Bike Rider Guides',
 blog_handle:blog,excerpt,tags,seo_title:titleTag,meta_description:description,
 required_internal_links:[...new Set(links)],blog_link_graph:graph,commercial_destinations:destinations,
 incoming_link_targets:incoming,qa:{minimum_words:minimumWords,minimum_h2:12,minimum_faq:9,minimum_images:4,
 minimum_product_links:3,minimum_collection_links:2,minimum_blog_links:3,minimum_internal_links:8}};
}
