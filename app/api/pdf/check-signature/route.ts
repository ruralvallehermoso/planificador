import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const signatureId = searchParams.get('id');

    if (!signatureId) {
      return new NextResponse('ID missing', { status: 400 });
    }

    const log = await prisma.webhookLog.findFirst({
      where: {
        provider: `autofirma_${signatureId}`
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!log) {
      return NextResponse.json({ status: 'PENDING' });
    }

    const payload = log.payload as any;
    return NextResponse.json({ 
      status: 'COMPLETED', 
      signedPdf: payload.signedPdf 
    });
  } catch (error) {
    console.error('Error checking signature:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
