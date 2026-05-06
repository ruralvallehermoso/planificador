import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/pdf/autofirma/signed
 * AutoFirma envía POST con op=put&v=1_0&id=<fileid>&dat=<base64_signed_pdf>
 * Almacena el PDF firmado.
 */
export async function POST(request: Request) {
  try {
    const text = await request.text();
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

    // Actualizar el registro con los datos firmados
    await prisma.webhookLog.update({
      where: { id },
      data: {
        provider: 'autofirma_signed',
        payload: { signedPdf: dat, status: 'COMPLETED', signedAt: new Date().toISOString() },
      },
    });

    console.log('[AutoFirma Signed] PDF firmado almacenado para id:', id);
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[AutoFirma Signed] Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
