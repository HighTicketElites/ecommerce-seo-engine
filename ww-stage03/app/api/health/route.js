import {NextResponse} from 'next/server'; import {listManifests} from '../../../lib/manifest.js'; import {publicConfigStatus} from '../../../lib/config.js';
export const dynamic='force-dynamic';
export function GET(){return NextResponse.json({service:'wattwheelz-shopify-content-ops',mode:'controlled_human_approval',manifests:listManifests().map(x=>({id:x.id,draft:x.draft_readiness,publish:x.publish_readiness})),config:publicConfigStatus()},{headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});}
