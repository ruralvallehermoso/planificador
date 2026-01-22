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
    const [config, setConfig] = useState(report?.config || { gradeColumn: '', nameColumn: '' })
    const [isSaving, setIsSaving] = useState(false)
    const [columns, setColumns] = useState<string[]>(rawData.length > 0 ? Object.keys(rawData[0]) : [])

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
            const data = XLSX.utils.sheet_to_json(ws)

            if (data.length > 0) {
                setRawData(data)
                setColumns(Object.keys(data[0] as object))
                setCurrentPage(1)
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

    const getChartData = () => {
        if (!config.gradeColumn || rawData.length === 0) return { passed: 0, failed: 0, passedPct: 0, failedPct: 0 }

        let passed = 0
        let failed = 0

        rawData.forEach(row => {
            const grade = parseFloat(row[config.gradeColumn])
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

    const chartData = getChartData()
    const pieData = [
        { name: 'Aprobados', value: chartData.passed, color: '#22c55e' },
        { name: 'Suspensos', value: chartData.failed, color: '#ef4444' },
    ]

    // Pagination logic
    const totalPages = Math.ceil(rawData.length / itemsPerPage)
    const paginatedData = rawData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="z-20 relative">
                    <CardHeader>
                        <CardTitle>Importar Datos</CardTitle>
                        <CardDescription>Sube un archivo Excel o CSV con las notas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                            <Input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <div className="bg-blue-50 p-4 rounded-full mb-3">
                                    <Upload className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">Haz clic para subir archivo</span>
                                <span className="text-xs text-gray-500 mt-1">Soporta .xlsx, .xls, .csv</span>
                            </Label>
                        </div>

                        {columns.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Columna de Nota *</Label>
                                    <Select
                                        value={config.gradeColumn}
                                        onValueChange={(val) => setConfig({ ...config, gradeColumn: val })}
                                    >
                                        <SelectTrigger className="w-full bg-white z-50">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100] max-h-[300px]">
                                            {columns.map(col => (
                                                <SelectItem key={col} value={col}>{col}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Columna de Nombre (Opcional)</Label>
                                    <Select
                                        value={config.nameColumn}
                                        onValueChange={(val) => setConfig({ ...config, nameColumn: val })}
                                    >
                                        <SelectTrigger className="w-full bg-white z-50">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100] max-h-[300px]">
                                            {columns.map(col => (
                                                <SelectItem key={col} value={col}>{col}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="z-10 relative">
                    <CardHeader>
                        <CardTitle>Resumen Gráfico</CardTitle>
                        <CardDescription>Análisis de resultados basado en la columna seleccionada</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                        {config.gradeColumn && chartData.passed + chartData.failed > 0 ? (
                            <div className="w-full h-[300px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>

                                {/* Centered stats inside pie chart */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="text-3xl font-bold text-gray-900">{chartData.passed + chartData.failed}</span>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-2 mb-2 text-center">
                                    <div className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-xl border border-green-100">
                                        <div className="text-2xl font-bold text-green-700">{chartData.passed}</div>
                                        <div className="text-sm font-medium text-green-600">{chartData.passedPct}%</div>
                                        <div className="text-xs text-green-600 font-medium uppercase mt-1">Aprobados</div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-xl border border-red-100">
                                        <div className="text-2xl font-bold text-red-700">{chartData.failed}</div>
                                        <div className="text-sm font-medium text-red-600">{chartData.failedPct}%</div>
                                        <div className="text-xs text-red-600 font-medium uppercase mt-1">Suspensos</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Sube datos y selecciona la columna de notas para ver el gráfico</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {rawData.length > 0 && (
                <Card className="z-0 relative">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TableIcon className="w-5 h-5" />
                            Datos Importados
                        </CardTitle>
                        <div className="text-sm text-gray-500">
                            Página {currentPage} de {totalPages}
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
                                        {paginatedData.map((row, idx) => {
                                            const grade = config.gradeColumn ? parseFloat(row[config.gradeColumn]) : NaN
                                            const status = getGradeStatus(grade)
                                            let rowClass = "hover:bg-gray-50/50 transition-colors"

                                            // Apply row coloring only if grade column is selected and valid
                                            if (config.gradeColumn && !isNaN(grade)) {
                                                if (status === 'passed') rowClass = "bg-green-50/60 hover:bg-green-100/60"
                                                if (status === 'failed') rowClass = "bg-red-50/60 hover:bg-red-100/60"
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
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-xs text-gray-500">
                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, rawData.length)} de {rawData.length} filas
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
