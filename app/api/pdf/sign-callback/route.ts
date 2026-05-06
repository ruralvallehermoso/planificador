import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Endpoint para recibir el PDF firmado desde AutoFirma.
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const signatureId = searchParams.get('id');

    if (!signatureId) {
      return new NextResponse('ID de firma no proporcionado', { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';
    let signedData: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      signedData = formData.get('data') as string;
    } else {
      signedData = await request.text();
    }

    if (!signedData) {
      return new NextResponse('No se recibió el documento firmado', { status: 400 });
    }

    // Guardamos en WebhookLog para que el frontend pueda consultarlo
    await prisma.webhookLog.create({
      data: {
        provider: `autofirma_${signatureId}`,
        payload: {
          signedPdf: signedData,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    console.log(`PDF firmado recibido correctamente para ID: ${signatureId}`);

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error en el callback de AutoFirma:', error);
    return new NextResponse('Error procesando la firma', { status: 500 });
  }
}
