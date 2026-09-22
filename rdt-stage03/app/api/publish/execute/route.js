import { NextResponse } from 'next/server';
import { executePublication } from '../../../../lib/publish.js';
import { renderPublicationErrorPage, renderPublicationResult } from '../../../../lib/result-page.js';
import { cookieValue, decryptSession, safeEqual } from '../../../../lib/security.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  let response;
  try {
    const session=decryptSession(cookieValue(request.headers.get('cookie'),'rdt_pub_approval_session'));
    if (session.purpose !== 'execute_publication') throw new Error('Unexpected approval session purpose');
    const form=await request.formData();
    if (!safeEqual(form.get('approval_nonce'),session.approval?.nonce)) throw new Error('Approval nonce validation failed');
    const result=await executePublication(session.auth,session.approval);
    response=new NextResponse(renderPublicationResult(result,session.auth.shop),{status:result.pass?200:409,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'}});
  } catch (error) {
    response=new NextResponse(renderPublicationErrorPage(error),{status:500,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'}});
  }
  response.cookies.set('rdt_pub_approval_session','',{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:0});
  return response;
}
