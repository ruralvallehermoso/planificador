import { PDFDocument, rgb } from 'pdf-lib';

export interface TextAnnotation {
  id: string;
  pageIndex: number; // 0-indexed
  text: string;
  x: number;
  y: number; // Browser coordinate (top-left origin) relative to the unscaled page size
  fontSize: number;
}

/**
 * Añade anotaciones de texto a un PDF existente.
 * 
 * @param fileBuffer El ArrayBuffer del PDF original
 * @param annotations Lista de anotaciones con su texto y coordenadas
 * @returns El Uint8Array del PDF modificado
 */
export async function addTextToPdf(fileBuffer: ArrayBuffer, annotations: TextAnnotation[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pages = pdfDoc.getPages();

  for (const annotation of annotations) {
    if (annotation.pageIndex < 0 || annotation.pageIndex >= pages.length) continue;
    
    const page = pages[annotation.pageIndex];
    const { height } = page.getSize();
    
    // pdf-lib usa coordenadas desde abajo a la izquierda (bottom-left)
    // El navegador usa arriba a la izquierda (top-left)
    // Ajustamos la Y para que encaje
    const pdfY = height - annotation.y - annotation.fontSize;

    page.drawText(annotation.text, {
      x: annotation.x,
      y: pdfY,
      size: annotation.fontSize,
      color: rgb(0, 0, 0),
    });
  }

  return await pdfDoc.save();
}
