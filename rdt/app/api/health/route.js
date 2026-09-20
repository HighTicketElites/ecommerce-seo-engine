export const dynamic='force-dynamic';
export function GET(){
  return Response.json({
    service:'resideterra-seo-draft-generator',
    mode:'draft_only',
    git_backed:true,
    job:'fire-bowl-vs-fire-water-bowl',
    ready:{
      shop:Boolean(process.env.RDT_SHOPIFY_SHOP),
      clientId:Boolean(process.env.RDT_SHOPIFY_CLIENT_ID),
      clientSecret:Boolean(process.env.RDT_SHOPIFY_CLIENT_SECRET)
    }
  },{headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
}
