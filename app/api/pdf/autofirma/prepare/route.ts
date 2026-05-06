import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/pdf/autofirma/prepare
 * Almacena un PDF pendiente de firmar y devuelve un ID.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = body.data ?? '';

    const id = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''); // 16 chars hex

    await prisma.webhookLog.create({
      data: {
        id,
        provider: 'autofirma_pending',
        payload: { pdfData: data, status: 'PENDING' },
      },
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error storing PDF for signing:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
