import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/pdf/autofirma/retrieve
 * AutoFirma envía POST con op=get&v=1_0&id=<fileid>
 * Devuelve los datos del PDF pendiente de firma.
 */
export async function POST(request: Request) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const op = params.get('op');
    const id = params.get('id');

    console.log('[AutoFirma Retrieve] op:', op, 'id:', id);

    if (op !== 'get' || !id) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    const log = await prisma.webhookLog.findUnique({ where: { id } });

    if (!log) {
      console.log('[AutoFirma Retrieve] Not found:', id);
      return new NextResponse('Not found', { status: 404 });
    }

    const payload = log.payload as any;
    const pdfData = payload?.pdfData;

    if (!pdfData) {
      return new NextResponse('No data', { status: 404 });
    }

    console.log('[AutoFirma Retrieve] Returning PDF data, length:', pdfData.length);
    return new NextResponse(pdfData, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('[AutoFirma Retrieve] Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
