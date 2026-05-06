import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/pdf/autofirma/status/[id]
 * Frontend polls para comprobar si AutoFirma ha terminado de firmar.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const log = await prisma.webhookLog.findUnique({ where: { id } });

    if (!log) {
      return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
    }

    const payload = log.payload as any;

    if (payload?.status === 'COMPLETED' && payload?.signedPdf) {
      return NextResponse.json({
        status: 'COMPLETED',
        signedPdf: payload.signedPdf,
      });
    }

    return NextResponse.json({ status: 'PENDING' });
  } catch (error) {
    console.error('[AutoFirma Status] Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
