import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface TextAnnotation {
  id: string;
  pageIndex: number; // 0-indexed
  text: string;
  x: number;
  y: number; // Browser coordinate (top-left origin) relative to the unscaled page size
  fontSize: number;
  maxWidth?: number;
}

/**
 * Añade anotaciones de texto a un PDF existente.
 */
export async function addTextToPdf(fileBuffer: ArrayBuffer, annotations: TextAnnotation[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const annotation of annotations) {
    if (annotation.pageIndex < 0 || annotation.pageIndex >= pages.length) continue;
    
    const page = pages[annotation.pageIndex];
    const { height } = page.getSize();

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

  return await pdfDoc.save();
}
