import { appUrl } from '../../../lib/config.js';
export const dynamic='force-dynamic';
export function GET(){
  let configuredAppUrl=null; try{configuredAppUrl=appUrl();}catch{}
  return Response.json({
    service:'resideterra-seo-draft-generator',
    mode:'draft_only',
    git_backed:true,
    job:'fire-bowl-vs-fire-water-bowl',
    configuredAppUrl,
    ready:{
      shop:Boolean(process.env.RDT_SHOPIFY_SHOP),
      clientId:Boolean(process.env.RDT_SHOPIFY_CLIENT_ID),
      clientSecret:Boolean(process.env.RDT_SHOPIFY_CLIENT_SECRET),
      appUrl:Boolean(process.env.RDT_APP_URL),
      sessionSecret:Boolean(process.env.RDT_SESSION_SECRET)
    }
  },{headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
}
