import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type AnnotationType = 'text' | 'signature';

export interface TextAnnotation {
  id: string;
  type: AnnotationType;
  pageIndex: number; // 0-indexed
  text: string;
  x: number;
  y: number; // Browser coordinate (top-left origin) relative to the unscaled page size
  fontSize: number;
  maxWidth?: number;
  // Campos específicos de firma
  signerName?: string;
  signerOrg?: string;
}

// Dimensiones del sello de firma (en unidades PDF sin escalar)
export const SIGNATURE_WIDTH = 220;
export const SIGNATURE_HEIGHT = 60;

/**
 * Añade anotaciones de texto y firmas visuales a un PDF existente.
 */
export async function addTextToPdf(fileBuffer: ArrayBuffer, annotations: TextAnnotation[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const annotation of annotations) {
    if (annotation.pageIndex < 0 || annotation.pageIndex >= pages.length) continue;
    
    const page = pages[annotation.pageIndex];
    const { height } = page.getSize();

    if (annotation.type === 'signature') {
      // Dibujar sello de firma visual
      const boxWidth = annotation.maxWidth || SIGNATURE_WIDTH;
      const boxHeight = SIGNATURE_HEIGHT;
      const pdfY = height - annotation.y - boxHeight;

      // Fondo del sello
      page.drawRectangle({
        x: annotation.x,
        y: pdfY,
        width: boxWidth,
        height: boxHeight,
        color: rgb(0.96, 0.97, 1), // Azul muy claro
        borderColor: rgb(0.3, 0.45, 0.75),
        borderWidth: 1,
      });

      // Icono de candado (texto)
      page.drawText('🔒', {
        x: annotation.x + 6,
        y: pdfY + boxHeight - 16,
        size: 10,
        font,
      });

      // Título
      page.drawText('Firmado digitalmente', {
        x: annotation.x + 20,
        y: pdfY + boxHeight - 15,
        size: 8,
        font: fontBold,
        color: rgb(0.15, 0.25, 0.55),
      });

      // Nombre del firmante
      const signerName = annotation.signerName || 'No especificado';
      page.drawText(`Por: ${signerName}`, {
        x: annotation.x + 8,
        y: pdfY + boxHeight - 30,
        size: 8,
        font,
        color: rgb(0.2, 0.2, 0.2),
        maxWidth: boxWidth - 16,
      });

      // Organización
      if (annotation.signerOrg) {
        page.drawText(`Org: ${annotation.signerOrg}`, {
          x: annotation.x + 8,
          y: pdfY + boxHeight - 42,
          size: 7,
          font,
          color: rgb(0.35, 0.35, 0.35),
          maxWidth: boxWidth - 16,
        });
      }

      // Fecha
      const dateStr = new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      page.drawText(`Fecha: ${dateStr}`, {
        x: annotation.x + 8,
        y: pdfY + 6,
        size: 7,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });

    } else {
      // Anotación de texto normal
      if (!annotation.text.trim()) continue;
      
      const pdfY = height - annotation.y - annotation.fontSize;

      page.drawText(annotation.text, {
        x: annotation.x,
        y: pdfY,
        size: annotation.fontSize,
        font,
        color: rgb(0, 0, 0),
        maxWidth: annotation.maxWidth,
        lineHeight: annotation.fontSize * 1.2,
      });
    }
  }

  return await pdfDoc.save();
}
