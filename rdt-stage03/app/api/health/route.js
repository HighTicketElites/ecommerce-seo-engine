import { NextResponse } from 'next/server';
import { listManifests } from '../../../lib/manifest.js';
import { publicConfigStatus } from '../../../lib/config.js';

export const dynamic = 'force-dynamic';
export function GET() {
  return NextResponse.json({service:'resideterra-shopify-content-ops',mode:'controlled_human_approval',manifests:listManifests().map(item=>({id:item.id,draft:item.draft_readiness,publish:item.publish_readiness})),config:publicConfigStatus()},{headers:{'cache-control':'no-store','x-robots-tag':'noindex'}});
}
