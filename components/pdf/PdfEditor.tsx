"use client";

import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, Upload, X, Type } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { addTextToPdf, TextAnnotation } from '@/lib/pdf/pdf-utils';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setAnnotations([]);
      setSelectedPageIndex(0);
    } else {
      toast.error('Por favor, selecciona un archivo PDF válido.');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') return;

    if (!pageContainerRef.current) return;
    
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const unscaledX = x / scale;
    const unscaledY = y / scale;

    const newAnnotation: TextAnnotation = {
      id: crypto.randomUUID(),
      pageIndex: selectedPageIndex,
      text: '',
      x: unscaledX,
      y: unscaledY,
      fontSize: 12,
      maxWidth: 200,
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  const updateAnnotation = (id: string, updates: Partial<TextAnnotation>) => {
    setAnnotations(annotations.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleResizeStart = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const annotation = annotations.find(a => a.id === id);
    if (!annotation) return;
    
    const initialWidth = (annotation.maxWidth || 200) * scale;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(50, initialWidth + deltaX);
      setAnnotations(prev => prev.map(a => 
        a.id === id ? { ...a, maxWidth: newWidth / scale } : a
      ));
    };
    
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleDragStart = (id: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName.toLowerCase() === 'textarea' ||
      target.tagName.toLowerCase() === 'input' ||
      target.closest('.resize-handle')
    ) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const annotation = annotations.find(a => a.id === id);
    if (!annotation) return;
    
    const initialX = annotation.x;
    const initialY = annotation.y;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;
      setAnnotations(prev => prev.map(a => 
        a.id === id ? { ...a, x: initialX + deltaX, y: initialY + deltaY } : a
      ));
    };
    
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const removeAnnotation = (id: string, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); }
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const generateModifiedPdf = async (): Promise<Uint8Array> => {
    if (!file) throw new Error('No file');
    const fileBuffer = await file.arrayBuffer();
    // Incluir textos con contenido
    const validAnnotations = annotations.filter(a => a.text.trim().length > 0);
    return await addTextToPdf(fileBuffer, validAnnotations);
  };

  const handleDownload = async () => {
    if (!file) return;
    try {
      const toastId = toast.loading('Procesando PDF...');
      const modifiedPdfBytes = await generateModifiedPdf();
      const blob = new Blob([modifiedPdfBytes as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `editado_${file.name}`);
      toast.success('PDF descargado correctamente', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al procesar el PDF.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {file ? 'Cambiar PDF' : 'Subir PDF'}
          </label>
          
          {file && (
            <span className="text-sm text-gray-600 font-medium hidden sm:inline-block max-w-[200px] truncate">
              {file.name}
            </span>
          )}
        </div>

        {file && (
          <div className="flex items-center gap-3">
            {/* Herramientas de anotación */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mr-2">
              <div className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700">
                <Type className="w-4 h-4" />
                Texto
              </div>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
              <span className="font-medium">Zoom:</span>
              <button onClick={() => setScale(Math.max(0.5, scale - 0.1))} className="hover:text-blue-600 px-1">-</button>
              <span>{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(Math.min(3, scale + 0.1))} className="hover:text-blue-600 px-1">+</button>
            </div>

            {/* Botón Descargar */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          </div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar for Pages */}
        {file && numPages > 0 && (
          <div className="w-48 bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-2 shrink-0">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Páginas ({numPages})
            </span>
            {Array.from(new Array(numPages), (el, index) => {
               const pageAnnotations = annotations.filter(a => a.pageIndex === index && a.text.trim().length > 0);
               return (
                <button
                    key={`page_${index + 1}`}
                    onClick={() => setSelectedPageIndex(index)}
                    className={`p-2 text-sm text-left rounded-md transition-colors flex justify-between items-center ${
                    selectedPageIndex === index 
                        ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                >
                    <span>Página {index + 1}</span>
                    {pageAnnotations.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                        {pageAnnotations.length}
                    </span>
                    )}
                </button>
               );
            })}
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center items-start">
          {!file ? (
            <div className="flex flex-col items-center justify-center text-gray-400 h-full max-w-sm text-center">
              <Upload className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-600 mb-2">Ningún documento seleccionado</p>
              <p className="text-sm">Sube un archivo PDF para comenzar a editarlo.</p>
            </div>
          ) : (
            <div className="relative shadow-xl bg-white select-none transition-transform origin-top">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="p-12 text-gray-500 flex items-center justify-center h-[800px] w-[600px] bg-white">
                    Cargando documento...
                  </div>
                }
                error={
                  <div className="p-12 text-red-500 flex items-center justify-center h-[800px] w-[600px] bg-white">
                    Error al cargar el PDF.
                  </div>
                }
              >
                <div 
                  ref={pageContainerRef} 
                  className="relative cursor-text"
                  onClick={handlePageClick}
                  style={{ width: 'fit-content', height: 'fit-content' }}
                >
                  <div className="overflow-hidden bg-white">
                     <Page 
                        pageNumber={selectedPageIndex + 1} 
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={<div className="bg-white min-h-[800px] min-w-[600px] animate-pulse"></div>}
                     />
                  </div>
                  
                  {/* Render Annotations overlay */}
                  {annotations
                    .filter(a => a.pageIndex === selectedPageIndex)
                    .map((annotation) => renderTextAnnotation(annotation))}
                </div>
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Renderizado de anotación de TEXTO ───
  function renderTextAnnotation(annotation: TextAnnotation) {
    return (
      <div
        key={annotation.id}
        className="absolute group z-10 origin-top-left cursor-move"
        style={{
          left: annotation.x * scale,
          top: annotation.y * scale,
          width: (annotation.maxWidth || 200) * scale,
          transform: 'translateY(-50%)'
        }}
        onMouseDown={(e) => handleDragStart(annotation.id, e)}
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={(e) => removeAnnotation(annotation.id, e)}
          className="absolute -top-4 -right-4 w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 flex shadow-sm hover:bg-red-600"
          title="Eliminar texto"
        >
          <X className="w-3 h-3" />
        </button>
        
        <textarea
          autoFocus={annotation.text === ''}
          value={annotation.text}
          onChange={(e) => {
            updateAnnotation(annotation.id, { text: e.target.value });
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onFocus={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          placeholder="Escribe aquí..."
          className="w-full bg-transparent border border-dashed border-blue-400 hover:border-blue-500 focus:border-blue-600 focus:bg-white/90 focus:outline-none px-1 text-black placeholder-gray-400 shadow-sm transition-all rounded-sm resize-none overflow-hidden min-h-[1.5em] cursor-text"
          style={{
            fontSize: `${annotation.fontSize * scale}px`,
            fontFamily: 'Helvetica, Arial, sans-serif',
            lineHeight: 1.2,
          }}
        />

        <div
          className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center resize-handle"
          onMouseDown={(e) => handleResizeStart(annotation.id, e)}
        >
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm" />
        </div>
      </div>
    );
  }
}
