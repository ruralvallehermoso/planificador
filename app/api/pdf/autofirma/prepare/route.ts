import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/pdf/autofirma/prepare
 * Almacena un PDF pendiente de firmar y devuelve un ID.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const id = crypto.randomUUID();

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
