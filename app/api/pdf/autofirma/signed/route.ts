import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/pdf/autofirma/signed
 * AutoFirma envía POST con los datos firmados.
 * Formato: op=put&v=1_0&id=<tracking_id>&dat=<base64_signed_pdf>
 */
export async function POST(request: Request) {
  try {
    const text = await request.text();
    console.log('[AutoFirma Signed] Raw body length:', text.length);
    console.log('[AutoFirma Signed] Body preview:', text.substring(0, 200));
    
    const params = new URLSearchParams(text);
    const op = params.get('op');
    const id = params.get('id');
    const dat = params.get('dat');

    console.log('[AutoFirma Signed] op:', op, 'id:', id, 'dat length:', dat?.length || 0);

    if (!id) {
      console.error('[AutoFirma Signed] Missing id');
      return new NextResponse('Missing id', { status: 400 });
    }

    if (!dat) {
      console.error('[AutoFirma Signed] Missing dat');
      return new NextResponse('Missing dat', { status: 400 });
    }

    // Intentar actualizar el registro existente, o crear uno nuevo
    try {
      await prisma.webhookLog.update({
        where: { id },
        data: {
          provider: 'autofirma_signed',
          payload: { signedPdf: dat, status: 'COMPLETED', signedAt: new Date().toISOString() },
        },
      });
    } catch {
      // Si no existe el registro con ese ID, crear uno nuevo
      await prisma.webhookLog.create({
        data: {
          id,
          provider: 'autofirma_signed',
          payload: { signedPdf: dat, status: 'COMPLETED', signedAt: new Date().toISOString() },
        },
      });
    }

    console.log('[AutoFirma Signed] PDF firmado almacenado para id:', id);
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[AutoFirma Signed] Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
