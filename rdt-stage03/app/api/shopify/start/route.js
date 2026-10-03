import { NextResponse } from 'next/server';
import { approvalTtlMs } from '../../../../lib/config.js';
import { loadManifest } from '../../../../lib/manifest.js';
import { prepareApproval } from '../../../../lib/publish.js';
import { renderApprovalPage } from '../../../../lib/result-page.js';
import { encryptSession } from '../../../../lib/security.js';
import { serverAuth } from '../../../../lib/shopify.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  try {
    const form = await request.formData();
    const job = String(form.get('job') || '');
    const manifest = loadManifest(job);
    if (manifest.publish_readiness !== 'pilot_approved') {
      throw new Error(`${job} is locked for publication`);
    }

    const auth = await serverAuth();
    const result = await prepareApproval(auth, job);
    const encrypted = encryptSession({
      purpose: 'execute_publication',
      auth,
      approval: result.approval,
      exp: result.approval.exp,
    });

    const response = new NextResponse(renderApprovalPage(result), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      },
    });

    response.cookies.set('rdt_pub_approval_session', encrypted, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: Math.floor(approvalTtlMs() / 1000),
    });

    return response;
  } catch (error) {
    return NextResponse.json({
      error: error?.message || String(error),
      safety: 'No Shopify publication action was executed.',
    }, {
      status: 500,
      headers: {
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      },
    });
  }
}
