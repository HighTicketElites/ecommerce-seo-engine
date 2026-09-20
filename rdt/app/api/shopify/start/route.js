import { appUrl } from '../../../../lib/config.js';
import { randomToken, signSession } from '../../../../lib/security.js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const JOB="fire-bowl-vs-fire-water-bowl";
function begin(){
  const session=signSession({job:JOB,nonce:randomToken(),exp:Date.now()+10*60*1000});
  const headers=new Headers({Location:new URL('/api/shopify/install',appUrl()).toString(),'Cache-Control':'no-store'});
  headers.append('Set-Cookie',`rdt_run_session=${encodeURIComponent(session)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return new Response(null,{status:303,headers});
}
export async function GET(){try{return begin();}catch(error){return Response.json({error:error.message,safety:'No Shopify action was executed.'},{status:401,headers:{'cache-control':'no-store'}});}}
export async function POST(){return GET();}
