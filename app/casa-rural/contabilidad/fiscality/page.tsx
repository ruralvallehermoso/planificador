'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Loader2, AlertTriangle } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getFiscalityData, type FiscalYearData } from '@/app/actions/fiscality';

export default function FiscalityPage() {
    const [data, setData] = useState<FiscalYearData[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await getFiscalityData();
            setData(result);
        } catch (error) {
            console.error('Error loading fiscality data:', error);
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
            const promises = invoices.map(async (inv) => {
                if (!inv.pdfUrl) return;

                try {
                    const response = await fetch(inv.pdfUrl);
                    if (!response.ok) throw new Error(`Failed to fetch ${inv.pdfUrl}`);
                    const blob = await response.blob();

                    // Clean filename: YYYY-MM-DD_Provider.pdf
                    const dateStr = new Date(inv.date).toISOString().split('T')[0];
                    const safeProvider = (inv.provider || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
                    const filename = `${dateStr}_${safeProvider}_${inv.id}.pdf`;

                    folder.file(filename, blob);
                } catch (err) {
                    console.error(`Error downloading invoice ${inv.id}:`, err);
                    // Add error log to zip?
                    folder.file(`ERROR_${inv.id}.txt`, `Failed to download: ${inv.pdfUrl}\n${err}`);
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
                <h1 className="text-2xl font-bold text-gray-900">Fiscalidad y Facturas</h1>
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
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                                                {q.quarter}T
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {q.quarter}º Trimestre
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {q.invoices.length} facturas registradas
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-medium text-gray-900">
                                                {q.invoices.reduce((sum, inv) => sum + Number(inv.amount), 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
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
