import { NextResponse } from 'next/server';

/**
 * Endpoint para recibir el PDF firmado desde AutoFirma.
 * AutoFirma enviará un POST con el contenido del PDF firmado en el cuerpo o en un parámetro 'data'.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let signedData: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      signedData = formData.get('data') as string;
    } else {
      // Intentar leer como texto plano o binario si viene directo
      signedData = await request.text();
    }

    if (!signedData) {
      return new NextResponse('No se recibió el documento firmado', { status: 400 });
    }

    // Aquí podrías guardar el documento en una base de datos, en un storage (S3/Vercel Blob), etc.
    // Por ahora, como es una integración básica, podríamos devolver una respuesta exitosa.
    // Nota: El navegador no verá esta respuesta, la verá la aplicación AutoFirma.
    
    console.log('PDF firmado recibido correctamente.');

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error en el callback de AutoFirma:', error);
    return new NextResponse('Error procesando la firma', { status: 500 });
  }
}
