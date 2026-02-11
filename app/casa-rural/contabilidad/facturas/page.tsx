'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Loader2, Trash2 } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getFiscalityData, getOrphanedBlobs, deleteOrphanedBlob, type FiscalYearData } from '@/app/actions/fiscality';
import { toast } from 'sonner';

export default function InvoicesPage() {
    const [data, setData] = useState<FiscalYearData[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const fiscalData = await getFiscalityData();
            setData(fiscalData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadQuarter = async (year: number, quarter: number, invoices: any[]) => {
        const key = `${year}-Q${quarter}`;
        setDownloading(key);

        try {
            const zip = new JSZip();
            const folderName = `Facturas_${year}_T${quarter}`;
            const folder = zip.folder(folderName);

            if (!folder) throw new Error('Failed to create zip folder');

            // Download each PDF and add to ZIP
            // Download each PDF and add to ZIP
            const promises = invoices.map(async (inv: any) => {
                let urlToFetch = '';

                if (inv.id < 0 && inv.pdfUrl) {
                    // Manual blob: id is negative. Use public URL directly.
                    urlToFetch = inv.pdfUrl;
                } else {
                    // DB Invoice: Use secure proxy
                    urlToFetch = `/api/invoices/${inv.id}`;
                }

                try {
                    const response = await fetch(urlToFetch);
                    if (!response.ok) throw new Error(`Failed to fetch invoice ${inv.id}: ${response.statusText}`);
                    const blob = await response.blob();

                    // Clean filename: YYYY-MM-DD_Provider.pdf
                    const dateStr = new Date(inv.date).toISOString().split('T')[0];
                    const safeProvider = (inv.provider || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
                    const filename = `${dateStr}_${safeProvider}_${Math.abs(inv.id)}.pdf`;

                    folder.file(filename, blob);
                } catch (err) {
                    console.error(`Error downloading invoice ${inv.id}:`, err);
                    folder.file(`ERROR_${Math.abs(inv.id)}.txt`, `Failed to download: ${inv.pdfUrl}\n${err}`);
                }
            });

            await Promise.all(promises);

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${folderName}.zip`);

        } catch (error) {
            console.error('Error generating zip:', error);
            alert('Error generando el archivo ZIP. Revisa la consola.');
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No hay facturas registradas</h3>
                <p className="text-gray-500 mt-1">Sube facturas para que aparezcan aquí organizadas por trimestres.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Facturas</h1>
                <p className="text-gray-600">Descarga todas las facturas de gastos organizadas por trimestres para la gestoría.</p>
            </header>

            <div className="space-y-6">
                {data.map((yearGroup) => (
                    <div key={yearGroup.year} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">Ejercicio {yearGroup.year}</h2>
                            <span className="text-sm text-gray-500 font-medium bg-gray-200 px-2 py-1 rounded-md">
                                {yearGroup.quarters.reduce((acc, q) => acc + q.invoices.length, 0)} facturas
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {yearGroup.quarters.map((q) => (
                                <div key={`${yearGroup.year}-${q.quarter}`} className="px-6 py-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                                                {q.quarter}T
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {q.quarter}º Trimestre
                                                </h3>
                                                <div className="text-sm text-gray-500">
                                                    <p>{q.invoices.length} facturas registradas</p>

                                                    {/* Lista desplegable de facturas (opcional, o resumen) */}
                                                    <div className="mt-2 space-y-1">
                                                        {q.invoices.slice(0, 5).map(inv => (
                                                            <div key={inv.id} className="flex items-center justify-between text-xs bg-white border border-gray-100 rounded px-2 py-1">
                                                                <span className="truncate max-w-[200px]">{inv.provider}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {inv.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {q.invoices.length > 5 && (
                                                            <p className="text-xs text-gray-400 italic">... y {q.invoices.length - 5} más</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-medium text-gray-900">
                                                {q.invoices.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                            </p>
                                            <p className="text-xs text-gray-400">Total Gastos</p>
                                        </div>

                                        <button
                                            onClick={() => handleDownloadQuarter(yearGroup.year, q.quarter, q.invoices)}
                                            disabled={downloading === `${yearGroup.year}-Q${q.quarter}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-wait shrink-0 w-full sm:w-auto justify-center"
                                        >
                                            {downloading === `${yearGroup.year}-Q${q.quarter}` ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Generando ZIP...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4" />
                                                    Descargar ZIP
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
