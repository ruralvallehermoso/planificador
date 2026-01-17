import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inngest } from "@/inngest/client";


export async function POST(req: Request) {
    try {
        console.log('[Webhook] Iniciando procesamiento...');

        // 1. Leer headers para depuración
        const contentType = req.headers.get('content-type') || 'unknown';
        console.log(`[Webhook] Content-Type: ${contentType}`);

        // 2. Leer el cuerpo crudo como texto para evitar fallos de parsing
        const rawBody = await req.text();
        console.log(`[Webhook] Raw Body received (${rawBody.length} bytes)`);

        // Si el cuerpo está vacío, no hacemos nada pero avisamos
        if (!rawBody) {
            console.warn('[Webhook] Cuerpo vacío recibido');
            return NextResponse.json({ status: 'warning', message: 'Empty body' });
        }

        let parsedData: any = null;
        let isJson = false;

        // 3. Intentar parsear como JSON
        try {
            parsedData = JSON.parse(rawBody);
            isJson = true;
            console.log('[Webhook] Parseado correctamente como JSON');
        } catch (e) {
            console.log('[Webhook] No es un JSON válido. Tratando como texto plano/multipart');
            // Si falla, creamos un objeto simple con el contenido raw
            parsedData = { raw_content: rawBody, saved_as_fallback: true };
        }

        // 4. Intentar extraer datos útiles si es JSON
        let from = 'unknown';
        let subject = 'unknown';
        let plainBody = '';

        if (isJson) {
            from = parsedData.headers?.from || parsedData.envelope?.from || 'unknown';
            subject = parsedData.headers?.subject || 'unknown';
            plainBody = parsedData.plain || '';
        }

        console.log(`[Webhook] Metadatos extraídos - De: ${from}, Asunto: ${subject}`);
        if (plainBody) console.log('[Webhook] Texto plano detectado');

        // 5. PERSISTENCIA OBLIGATORIA
        // Guardamos lo que tengamos, sea JSON o el objeto fallback
        try {
            await prisma.webhookLog.create({
                data: {
                    provider: 'cloudmailin',
                    payload: parsedData, // Prisma se encarga de convertir objeto a JSONB
                }
            });
            console.log('[Webhook] ÉXITO: Payload guardado en BBDD');
        } catch (dbError) {
            console.error('[Webhook] ERROR CRÍTICO guardando en BBDD:', dbError);
            // Intentamos guardar un error simplificado si el payload es muy complejo o inválido
            try {
                await prisma.webhookLog.create({
                    data: {
                        provider: 'cloudmailin_error',
                        payload: { error: 'Failed to save original payload', raw_preview: rawBody.substring(0, 100) },
                    }
                });
            } catch (e) {
                console.error('[Webhook] Imposible guardar log de error', e);
            }
        }

        // 6. Lógica de adjuntos (solo si es JSON de cloudmailin)
        if (isJson && parsedData.attachments?.[0]) {
            const attachment = parsedData.attachments[0];
            if (attachment.content_type === 'application/pdf') {
                console.log(`[Webhook] PDF detectado: ${attachment.file_name}`);

                // 4. INTEGRACIÓN CON INNGEST (Gemini)
                const pdfBase64 = attachment.content;
                const pdfUrl = attachment.url; // Support for CloudMailin Attachment Store (S3/Azure/GCP)
                const fileName = attachment.file_name;

                if (pdfBase64 || pdfUrl) {
                    await inngest.send({
                        name: "invoice/received",
                        data: {
                            pdfBase64: pdfBase64,
                            pdfUrl: pdfUrl,
                            fileName: fileName,
                            from: from,
                        }
                    });
                    console.log(`[Webhook] Evento 'invoice/received' enviado a Inngest para ${fileName} (URL: ${!!pdfUrl}, Base64: ${!!pdfBase64})`);
                }
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('[Webhook] Error General no controlado:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
