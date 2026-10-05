import { runDraftJob } from '../../../../lib/job.js';
import { serverAuth } from '../../../../lib/shopify.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  return Response.json(
    { error: 'Method not allowed. Submit the Stage 02 form.' },
    { status: 405, headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } }
  );
}

export async function POST() {
  try {
    const auth = await serverAuth();
    const result = await runDraftJob(auth);
    return Response.json(result, {
      status: result.pass ? 200 : 409,
      headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' }
    });
  } catch (error) {
    return Response.json(
      { pass: false, error: error?.message || String(error), safety: 'No publication action was executed.' },
      { status: 500, headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } }
    );
  }
}
