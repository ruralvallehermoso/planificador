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
    const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all')

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]

            // Get header row preserving exact Excel column order
            const headerRow = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })[0] || []
            const headers = headerRow.map(h => String(h).trim()).filter(h => h.length > 0)

            // Parse data using defval to ensure empty cells are included (prevents column shift)
            const data = XLSX.utils.sheet_to_json(ws, { defval: "" })

            if (data.length > 0 && headers.length > 0) {
                setRawData(data)
                setColumns(headers)
                setConfig((prev: any) => ({ ...prev, columns: headers }))
                setCurrentPage(1)
                setFilterStatus('all')
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

    // Use the first chart for filtering context if multiple, or just disable filtering logic for now if complex.
    // For now, let's keep filtering logic but maybe bind it to the LAST interacted chart or just the first one?
    // User asked for "create new graphs". The click filtering might become ambiguous with multiple graphs.
    // Let's assume global filter applies to ALL charts? No, that relies on one column.
    // Simplifying: Filter probably creates confusion with multiple columns.
    // Let's keep filter but maybe clear it if charts change?
    // Actually, rows get colored based on which column? We need a "primary" column for row coloring/filtering?
    // Or maybe each chart filters independently? That's complex.
    // Let's assume the "Row Coloring" uses the FIRST chart's column as "Main Grade".

    const mainGradeColumn = config.charts?.[0]?.column

    // Filtering & Pagination logic based on Main Grade Column
    const filteredData = rawData.filter(row => {
        if (filterStatus === 'all' || !mainGradeColumn) return true
        const grade = parseFloat(row[mainGradeColumn])
        const status = getGradeStatus(grade)
        return status === filterStatus
    })

    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleChartClick = (data: any, column: string) => {
        // Only allow filtering if clicking on the main grade chart
        if (column !== mainGradeColumn) {
            toast.info("El filtrado solo está activo para el primer gráfico (principal)")
            return
        }

        if (data && data.payload && data.payload.type) {
            const type = data.payload.type as 'passed' | 'failed'
            setFilterStatus(prev => prev === type ? 'all' : type)
            setCurrentPage(1)
            toast.info(`Filtrando por: ${type === 'passed' ? 'Aprobados' : 'Suspensos'}`)
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

            <Card>
                <CardHeader>
                    <CardTitle>Notas Generales</CardTitle>
                    <CardDescription>Espacio para anotaciones libres sobre el examen</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Escribe aquí tus observaciones..."
                        className="min-h-[100px]"
                    />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* IMPORT & CONFIG - Smaller (Span 4) */}
                <Card className="lg:col-span-4 z-20 relative overflow-visible h-fit">
                    <CardHeader>
                        <CardTitle>Configuración</CardTitle>
                        <CardDescription>Importa datos y añade gráficos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                            <Input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <div className="bg-blue-50 p-3 rounded-full mb-2">
                                    <Upload className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">Subir Archivo (.xlsx)</span>
                            </Label>
                        </div>

                        {columns.length > 0 && (
                            <div className="space-y-4 pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-900">Añadir Gráfico de Notas</h4>
                                <div className="flex gap-2">
                                    <Select onValueChange={(val) => addChart(val)}>
                                        <SelectTrigger className="w-full bg-white border shadow-sm">
                                            <SelectValue placeholder="Seleccionar columna..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border rounded-lg shadow-lg max-h-[300px] z-[100]">
                                            {columns.map(col => (
                                                <SelectItem key={col} value={col} className="hover:bg-gray-100 cursor-pointer">{col}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-xs text-gray-500">Selecciona una columna para generar un nuevo gráfico de aprobados/suspensos.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* CHARTS - Larger (Span 8) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(config.charts || []).map((chart: any, idx: number) => {
                        const data = getChartData(chart.column)
                        const pieData = [
                            { name: 'Aprobados', value: data.passed, color: '#16a34a', type: 'passed' },
                            { name: 'Suspensos', value: data.failed, color: '#dc2626', type: 'failed' },
                        ]

                        return (
                            <Card key={idx} className="relative overflow-hidden">
                                <div className="absolute top-2 right-2 z-10">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500" onClick={() => removeChart(idx)}>
                                        <span className="sr-only">Eliminar</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                        </svg>
                                    </Button>
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base truncate" title={chart.column}>{chart.column}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center p-0 pb-4 h-[300px]">
                                    {data.passed + data.failed > 0 ? (
                                        <div className="w-full h-full relative flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RePieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={70}
                                                        outerRadius={100}
                                                        paddingAngle={2}
                                                        dataKey="value"
                                                        stroke="none"
                                                        onClick={(d) => handleChartClick(d, chart.column)}
                                                        className={idx === 0 ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.color}
                                                                opacity={idx === 0 && (filterStatus === 'all' || filterStatus === entry.type) ? 1 : (idx === 0 ? 0.3 : 1)}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip wrapperStyle={{ zIndex: 100 }} />
                                                </RePieChart>
                                            </ResponsiveContainer>

                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="flex flex-col items-center justify-center p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border w-[110px] h-[110px]">
                                                    <div className="text-center space-y-0.5">
                                                        <div className="flex flex-col leading-tight">
                                                            <span className="text-green-600 font-bold text-lg">{data.passed}</span>
                                                            <span className="text-[9px] text-gray-500 uppercase">Aprobados</span>
                                                        </div>
                                                        <div className="w-full h-px bg-gray-200 my-0.5"></div>
                                                        <div className="flex flex-col leading-tight">
                                                            <span className="text-red-600 font-bold text-lg">{data.failed}</span>
                                                            <span className="text-[9px] text-gray-500 uppercase">Suspensos</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 text-[10px] font-bold">
                                                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{data.passedPct}% Aprobado</span>
                                                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{data.failedPct}% Suspenso</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <span className="text-xs">Sin datos numéricos</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}

                    {(config.charts || []).length === 0 && (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                            <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                            <p>Añade un gráfico desde el panel de configuración</p>
                        </div>
                    )}
                </div>
            </div>

            {rawData.length > 0 && (
                <Card className="z-0 relative">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TableIcon className="w-5 h-5" />
                            Datos Importados
                            {filterStatus !== 'all' && (
                                <span className="ml-2 text-sm font-normal text-white bg-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    Filtro: {filterStatus === 'passed' ? 'Aprobados' : 'Suspensos'}
                                    <button onClick={() => setFilterStatus('all')} className="ml-1 hover:text-blue-100">x</button>
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
                                            // Row styling based on MAIN GRADE column (first chart)
                                            const mainGrade = mainGradeColumn ? parseFloat(row[mainGradeColumn]) : NaN
                                            const status = getGradeStatus(mainGrade)
                                            let rowClass = "hover:bg-gray-50/50 transition-colors"

                                            if (!isNaN(mainGrade)) {
                                                if (status === 'passed') rowClass = "bg-green-200 hover:bg-green-300 font-medium text-green-900 border-l-4 border-l-green-600"
                                                if (status === 'failed') rowClass = "bg-red-200 hover:bg-red-300 font-medium text-red-900 border-l-4 border-l-red-600"
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
            )}
        </div>
    )
}
