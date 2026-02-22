'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileSpreadsheet, Save, BarChart3, PieChart, Table as TableIcon } from 'lucide-react'
import * as XLSX from 'xlsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts'
import { toast } from "sonner"
import { saveExamGradeReport } from '@/lib/actions/exam-grades'

interface GradeTabsProps {
    report: any
    examId: string
}

export function GradeTabs({ report, examId }: GradeTabsProps) {
    const [notes, setNotes] = useState(report?.notes || '')
    const [rawData, setRawData] = useState<any[]>(report?.rawData || [])
    const [config, setConfig] = useState<any>(report?.config || { charts: [] })
    const [isSaving, setIsSaving] = useState(false)
    const [columns, setColumns] = useState<string[]>(
        report?.config?.columns || (rawData.length > 0 ? Object.keys(rawData[0]) : [])
    )
    const [filterConfig, setFilterConfig] = useState<{ type: 'none' | 'column' | 'thermometer', column?: string, status?: 'passed' | 'failed', failsCount?: number }>({ type: 'none' })

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // ... handleFileUpload y handleSave se mantienen igual

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]

            // Use raw array mode to get all rows as arrays — avoids any key/column mismatch
            const allRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "" })
            if (allRows.length < 2) return

            // Row 0 = headers, rest = data
            const rawHeaders = allRows[0] as any[]
            const headers: string[] = rawHeaders.map(h => String(h ?? "").trim())

            // Build objects manually: position i in data row → headers[i]
            const data = allRows.slice(1)
                .filter(row => row.some((cell: any) => cell !== "")) // skip fully empty rows
                .map(row => {
                    const obj: Record<string, any> = {}
                    headers.forEach((h, i) => {
                        if (h) obj[h] = row[i] ?? ""
                    })
                    return obj
                })

            const validHeaders = headers.filter(h => h.length > 0)

            if (data.length > 0 && validHeaders.length > 0) {
                setRawData(data)
                setColumns(validHeaders)
                setConfig((prev: any) => ({ ...prev, columns: validHeaders }))
                setCurrentPage(1)
                setFilterConfig({ type: 'none' })
                toast.success(`Importadas ${data.length} filas correctamente`)
            }
        }
        reader.readAsBinaryString(file)
    }

    const handleSave = async () => {
        setIsSaving(true)
        const result = await saveExamGradeReport(examId, {
            notes,
            rawData,
            config
        })

        if (result.success) {
            toast.success("Datos guardados correctamente")
        } else {
            toast.error("Error al guardar")
        }
        setIsSaving(false)
    }

    const getGradeStatus = (grade: number) => {
        if (isNaN(grade)) return 'neutral'
        return grade >= 5 ? 'passed' : 'failed'
    }

    const getChartData = (column: string) => {
        if (!column || rawData.length === 0) return { passed: 0, failed: 0, passedPct: 0, failedPct: 0 }

        let passed = 0
        let failed = 0

        rawData.forEach(row => {
            const grade = parseFloat(row[column])
            if (!isNaN(grade)) {
                if (grade >= 5) passed++
                else failed++
            }
        })

        const total = passed + failed
        return {
            passed,
            failed,
            passedPct: total > 0 ? ((passed / total) * 100).toFixed(1) : 0,
            failedPct: total > 0 ? ((failed / total) * 100).toFixed(1) : 0
        }
    }

    const addChart = (column: string) => {
        if (!column) return
        const newCharts = [...(config.charts || [])]
        // Avoid duplicates? Maybe allowed.
        newCharts.push({ id: Date.now().toString(), column })
        setConfig({ ...config, charts: newCharts })
    }

    const removeChart = (index: number) => {
        const newCharts = [...(config.charts || [])]
        newCharts.splice(index, 1)
        setConfig({ ...config, charts: newCharts })
    }

    const mainGradeColumn = config.charts?.[0]?.column

    // Filtering & Pagination logic
    const filteredData = rawData.filter(row => {
        if (filterConfig.type === 'none') return true

        if (filterConfig.type === 'column' && filterConfig.column) {
            const grade = parseFloat(row[filterConfig.column])
            return getGradeStatus(grade) === filterConfig.status
        }

        if (filterConfig.type === 'thermometer' && filterConfig.failsCount !== undefined) {
            const activeColumns = (config.charts || []).map((c: any) => c.column)
            let fails = 0
            let hasAnyData = false
            activeColumns.forEach((col: string) => {
                const val = parseFloat(row[col])
                if (!isNaN(val)) {
                    hasAnyData = true
                    if (val < 5) fails++
                }
            })
            return hasAnyData && fails === filterConfig.failsCount
        }

        return true
    })

    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleChartClick = (data: any, column: string) => {
        if (!data || !data.payload || !data.payload.type) return
        const type = data.payload.type as 'passed' | 'failed'

        if (filterConfig.type === 'column' && filterConfig.column === column && filterConfig.status === type) {
            setFilterConfig({ type: 'none' })
        } else {
            setFilterConfig({ type: 'column', column, status: type })
            setCurrentPage(1)
            toast.info(`Filtrando: ${column} (${type === 'passed' ? 'Aprobados' : 'Suspensos'})`, { id: 'filter-toast' })
        }
    }

    const handleThermometerClick = (data: any) => {
        if (!data || !data.activePayload || !data.activePayload[0]) return
        const fails = data.activePayload[0].payload.fails

        if (filterConfig.type === 'thermometer' && filterConfig.failsCount === fails) {
            setFilterConfig({ type: 'none' })
        } else {
            setFilterConfig({ type: 'thermometer', failsCount: fails })
            setCurrentPage(1)
            toast.info(`Filtrando alumnos con ${fails} suspenso${fails !== 1 ? 's' : ''}`, { id: 'filter-toast' })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Calificaciones y Resultados</h2>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>

            {/* Top Row: Config & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* IMPORT & CONFIG (Span 4) */}
                <Card className="md:col-span-5 lg:col-span-4 z-20 relative overflow-visible h-fit shadow-sm border-gray-200/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-gray-800">Configuración</CardTitle>
                        <CardDescription className="text-xs">Importa datos y añade gráficos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-blue-50/50 hover:border-blue-200 transition-all group">
                            <Input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <div className="bg-gray-50 group-hover:bg-blue-100/50 p-2.5 rounded-full mb-2 transition-colors">
                                    <Upload className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <span className="text-[13px] font-semibold text-gray-600 group-hover:text-blue-700 transition-colors">Subir Archivo (.xlsx)</span>
                            </Label>
                        </div>

                        {columns.length > 0 && (
                            <div className="space-y-3 pt-3 border-t border-gray-100">
                                <h4 className="text-[13px] font-semibold text-gray-700">Añadir Gráficos</h4>
                                <div className="space-y-2">
                                    <Select onValueChange={(val) => addChart(val)}>
                                        <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm text-[13px] h-9">
                                            <SelectValue placeholder="Seleccionar columna..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-[300px] z-[100]">
                                            {columns.map(col => (
                                                <SelectItem key={col} value={col} className="hover:bg-gray-50 cursor-pointer text-[13px]">{col}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start h-9 text-[13px] font-medium border-dashed border-gray-300 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-colors"
                                        onClick={() => setConfig({ ...config, showBarChart: !config.showBarChart })}
                                    >
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        {config.showBarChart ? 'Ocultar Termómetro General' : 'Añadir Termómetro General'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* NOTAS GENERALES (Span 8) */}
                <Card className="md:col-span-7 lg:col-span-8 shadow-sm border-gray-200/60 flex flex-col">
                    <CardHeader className="pb-3 border-b border-gray-50/50">
                        <CardTitle className="text-base text-gray-800">Notas Generales</CardTitle>
                        <CardDescription className="text-xs">Espacio para anotaciones libres sobre el examen</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-4">
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Escribe aquí tus observaciones..."
                            className="flex-1 min-h-[140px] resize-none focus-visible:ring-1 focus-visible:ring-blue-500 bg-gray-50/30 border-gray-200/80 text-[13px] p-4 placeholder:text-gray-400 leading-relaxed rounded-xl shadow-inner"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS ROW */}
            <div className="space-y-4 pt-2">
                {(config.charts || []).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(config.charts || []).map((chart: any, idx: number) => {
                            const data = getChartData(chart.column)
                            const pieData = [
                                { name: 'Aprobados', value: data.passed, color: '#16a34a', type: 'passed' },
                                { name: 'Suspensos', value: data.failed, color: '#dc2626', type: 'failed' },
                            ]

                            return (
                                <Card key={idx} className="relative overflow-hidden shadow-sm border-gray-200/60 group hover:shadow-md transition-all duration-200">
                                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-sm border border-gray-100" onClick={() => removeChart(idx)}>
                                            <span className="sr-only">Eliminar</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                            </svg>
                                        </Button>
                                    </div>
                                    <CardHeader className="pb-0 pt-4 px-5">
                                        <CardTitle className="text-[13px] font-semibold text-gray-700 truncate pr-6" title={chart.column}>{chart.column}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center p-0 pb-5 h-[230px]">
                                        {data.passed + data.failed > 0 ? (
                                            <div className="w-full h-full relative flex flex-col items-center justify-center mt-2">
                                                <div className="w-[160px] h-[160px] relative">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RePieChart>
                                                            <Pie
                                                                data={pieData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={50}
                                                                outerRadius={75}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                stroke="none"
                                                                onClick={(d) => handleChartClick(d, chart.column)}
                                                                className={idx === 0 ? "cursor-pointer hover:opacity-85 transition-opacity duration-200" : ""}
                                                            >
                                                                {pieData.map((entry, index) => {
                                                                    const isActive = filterConfig.type === 'column' && filterConfig.column === chart.column && filterConfig.status === entry.type;
                                                                    const isOtherActiveInSameChart = filterConfig.type === 'column' && filterConfig.column === chart.column && filterConfig.status !== entry.type;
                                                                    const isAnyFilterActive = filterConfig.type !== 'none';

                                                                    let opacity = 1;
                                                                    if (isOtherActiveInSameChart) opacity = 0.3;
                                                                    else if (isAnyFilterActive && filterConfig.column !== chart.column) opacity = 0.5;

                                                                    return (
                                                                        <Cell
                                                                            key={`cell-${index}`}
                                                                            fill={entry.color}
                                                                            opacity={opacity}
                                                                        />
                                                                    )
                                                                })}
                                                            </Pie>
                                                            <Tooltip wrapperStyle={{ zIndex: 100, fontSize: '11px' }} itemStyle={{ color: '#374151' }} />
                                                        </RePieChart>
                                                    </ResponsiveContainer>
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="text-center">
                                                            <span className="text-xl font-bold text-gray-800 leading-none">{data.passed + data.failed}</span>
                                                            <span className="block text-[9px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Total</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-center gap-2.5 text-[11px] font-semibold mt-auto px-5 w-full">
                                                    <div className="flex flex-col items-center flex-1 bg-green-50/50 rounded-md py-1.5 border border-green-100/50 hover:bg-green-50 transition-colors">
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-green-700">{data.passed}</span>
                                                            <span className="text-[10px] text-green-600/80">({data.passedPct}%)</span>
                                                        </div>
                                                        <span className="text-[8px] text-green-600/70 uppercase">Aprobados</span>
                                                    </div>
                                                    <div className="flex flex-col items-center flex-1 bg-red-50/50 rounded-md py-1.5 border border-red-100/50 hover:bg-red-50 transition-colors">
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-red-700">{data.failed}</span>
                                                            <span className="text-[10px] text-red-600/80">({data.failedPct}%)</span>
                                                        </div>
                                                        <span className="text-[8px] text-red-600/70 uppercase">Suspensos</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-400 flex flex-col items-center">
                                                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <span className="text-[11px] font-medium">Sin datos numéricos</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* TERMÓMETRO DE CLASE (BAR CHART) */}
                {config.showBarChart && (config.charts || []).length > 0 && (
                    <Card className="relative overflow-hidden shadow-sm border-orange-200/60 bg-gradient-to-br from-white to-orange-50/20">
                        <div className="absolute top-2 right-2 z-10 opacity-0 hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500 rounded-full" onClick={() => setConfig({ ...config, showBarChart: false })}>
                                <span className="sr-only">Cerrar</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </Button>
                        </div>
                        <CardHeader className="pb-2 pt-5 px-6">
                            <CardTitle className="text-sm font-semibold text-orange-900 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-orange-500" />
                                Termómetro de la Clase (Acumulación de Suspensos)
                            </CardTitle>
                            <CardDescription className="text-xs text-orange-700/70">
                                Distribución de alumnos según la cantidad de criterios seleccionados que han suspendido
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[260px] p-6 pt-0">
                            {(() => {
                                // 1. Recopilar columnas activas (criterios evaluados)
                                const activeColumns = (config.charts || []).map((c: any) => c.column);
                                const maxSuspensos = activeColumns.length;

                                // 2. Contar cuántos suspensos tiene cada alumno
                                const counts = new Array(maxSuspensos + 1).fill(0);
                                rawData.forEach(row => {
                                    let fails = 0;
                                    let hasAnyData = false;
                                    activeColumns.forEach((col: string) => {
                                        const val = parseFloat(row[col]);
                                        if (!isNaN(val)) {
                                            hasAnyData = true;
                                            if (val < 5) fails++;
                                        }
                                    });
                                    if (hasAnyData) {
                                        counts[fails]++;
                                    }
                                });

                                // 3. Formatear para Recharts
                                const barData = counts.map((count, i) => ({
                                    name: i === 0 ? 'Todo Aprobado' : `${i} Suspenso${i > 1 ? 's' : ''}`,
                                    alumnos: count,
                                    fails: i
                                }));

                                // Helper para colores progresivos según peligro (más suspensos = rojo más intenso)
                                const getFailColor = (fails: number) => {
                                    if (fails === 0) return '#22c55e'; // verde
                                    if (fails === 1) return '#f59e0b'; // naranja/amarillo
                                    if (fails === 2) return '#f97316'; // naranja fuerte
                                    if (fails === 3) return '#ef4444'; // rojo suave
                                    return '#b91c1c'; // rojo oscuro
                                };

                                return (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={barData}
                                            margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
                                            onClick={handleThermometerClick}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fed7aa" opacity={0.3} />
                                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9a3412' }} tickLine={false} axisLine={{ stroke: '#fdba74' }} />
                                            <YAxis tick={{ fontSize: 11, fill: '#9a3412' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <Tooltip
                                                cursor={{ fill: '#ffedd5', opacity: 0.4 }}
                                                contentStyle={{ borderRadius: '8px', border: '1px solid #fed7aa', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="alumnos" radius={[4, 4, 0, 0]} maxBarSize={60} className="cursor-pointer hover:opacity-80 transition-opacity">
                                                {barData.map((entry, index) => {
                                                    const isActive = filterConfig.type === 'thermometer' && filterConfig.failsCount === entry.fails;
                                                    const isOtherActive = filterConfig.type === 'thermometer' && filterConfig.failsCount !== entry.fails;
                                                    const opacity = isOtherActive ? 0.3 : (filterConfig.type !== 'none' && filterConfig.type !== 'thermometer' ? 0.5 : 1);

                                                    return <Cell key={`cell-${index}`} fill={getFailColor(entry.fails)} opacity={opacity} />
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                );
                            })()}
                        </CardContent>
                    </Card>
                )}

                {(config.charts || []).length === 0 && !config.showBarChart && (
                    <div className="w-full flex flex-col items-center justify-center h-[160px] border-2 border-dashed border-gray-200/80 rounded-xl text-gray-400 bg-gray-50/30 hover:bg-gray-50/80 transition-colors">
                        <PieChart className="w-10 h-10 mb-3 opacity-40 text-gray-400" />
                        <p className="text-[13px] font-medium text-gray-500">Añade un gráfico seleccionando una columna en la configuración</p>
                    </div>
                )}
            </div>

            {rawData.length > 0 && (
                <Card className="z-0 relative">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TableIcon className="w-5 h-5" />
                            Datos Importados
                            {filterConfig.type !== 'none' && (
                                <span className="ml-2 text-sm font-normal text-white bg-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    Filtro: {
                                        filterConfig.type === 'column'
                                            ? `${filterConfig.column} (${filterConfig.status === 'passed' ? 'Aprobados' : 'Suspensos'})`
                                            : `Alumnos con ${filterConfig.failsCount} suspenso${filterConfig.failsCount !== 1 ? 's' : ''}`
                                    }
                                    <button onClick={() => setFilterConfig({ type: 'none' })} className="ml-1 hover:text-blue-100">x</button>
                                </span>
                            )}
                        </CardTitle>
                        <div className="text-sm text-gray-500">
                            Página {currentPage} de {totalPages || 1}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            {columns.map(col => (
                                                <th key={col} className="px-6 py-3 font-semibold whitespace-nowrap bg-gray-50 z-10">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedData.length > 0 ? paginatedData.map((row, idx) => {
                                            let rowClass = "hover:bg-gray-50/50 transition-colors"

                                            if (filterConfig.type === 'column' && filterConfig.column) {
                                                const grade = parseFloat(row[filterConfig.column])
                                                const status = getGradeStatus(grade)
                                                if (!isNaN(grade)) {
                                                    if (status === 'passed') rowClass = "bg-green-100/50 hover:bg-green-100 font-medium text-green-900 border-l-4 border-l-green-500"
                                                    if (status === 'failed') rowClass = "bg-red-100/50 hover:bg-red-100 font-medium text-red-900 border-l-4 border-l-red-500"
                                                }
                                            } else if (filterConfig.type === 'thermometer' && filterConfig.failsCount !== undefined) {
                                                const dangerColor = filterConfig.failsCount === 0 ? 'green'
                                                    : filterConfig.failsCount === 1 ? 'yellow'
                                                        : filterConfig.failsCount === 2 ? 'orange' : 'red'
                                                rowClass = `bg-${dangerColor}-100/50 hover:bg-${dangerColor}-100 font-medium text-${dangerColor}-900 border-l-4 border-l-${dangerColor}-500`
                                            }

                                            return (
                                                <tr key={idx} className={rowClass}>
                                                    {columns.map(col => (
                                                        <td key={`${idx}-${col}`} className="px-6 py-4 truncate max-w-[200px]" title={String(row[col])}>
                                                            {String(row[col])}
                                                        </td>
                                                    ))}
                                                </tr>
                                            )
                                        }) : (
                                            <tr>
                                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                                    No hay resultados para el filtro seleccionado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-xs text-gray-500">
                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} filas
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )
            }
        </div >
    )
}
