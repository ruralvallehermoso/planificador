"use client"

import { useState, useMemo, useRef } from "react"
import { FpEvaluation } from "@prisma/client"
import { updateFpEvaluationData } from "@/lib/actions/fp-evaluations"
import { read, utils } from "xlsx"
import {
    FileSpreadsheet, UploadCloud, Save, BarChart3, Grip, ArrowLeft,
    CheckCircle2, XCircle, Search, Trash2, CheckSquare, Square
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts"

interface EvaluationDashboardProps {
    evaluation: FpEvaluation
}

export function EvaluationDashboard({ evaluation }: EvaluationDashboardProps) {
    // 1. STATE INITIALIZATION
    const [studentsData, setStudentsData] = useState<any[]>(() => {
        if (typeof evaluation.studentsData === 'string') {
            try { return JSON.parse(evaluation.studentsData as string) } catch { return [] }
        }
        return (evaluation.studentsData as any[]) || []
    })

    const [selectedCriteria, setSelectedCriteria] = useState<string[]>(() => {
        if (typeof evaluation.selectedCriteria === 'string') {
            try { return JSON.parse(evaluation.selectedCriteria as string) } catch { return [] }
        }
        return (evaluation.selectedCriteria as string[]) || []
    })

    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const ITEMS_PER_PAGE = 20

    // 2. EXCEL PARSING
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                // Generates array of objects
                const data = utils.sheet_to_json(ws, { defval: null })

                setStudentsData(data)
                // Reset criteria upon new file upload
                setSelectedCriteria([])
                setPage(1)
            } catch (error) {
                console.error("Error parsing Excel:", error)
                alert("Hubo un error al procesar el archivo Excel. Asegúrate de que tiene un formato válido.")
            } finally {
                setIsUploading(false)
                if (fileInputRef.current) fileInputRef.current.value = "" // reset
            }
        }
        reader.readAsBinaryString(file)
    }

    const saveChanges = async () => {
        setIsSaving(true)
        try {
            const result = await updateFpEvaluationData(evaluation.id, studentsData, selectedCriteria)
            if (result.success) {
                // optional toast
            } else {
                alert("Error al guardar datos")
            }
        } catch (error) {
            console.error(error)
            alert("Error de red al guardar")
        } finally {
            setIsSaving(false)
        }
    }

    const clearData = async () => {
        if (!confirm("¿Deseas eliminar todos los datos almacenados de esta evaluación?")) return
        setStudentsData([])
        setSelectedCriteria([])
        setIsSaving(true)
        await updateFpEvaluationData(evaluation.id, [], [])
        setIsSaving(false)
    }

    // 3. COMPUTED DATA PROPERTIES
    // Derive columns dynamically from the first valid object
    const allColumns = useMemo(() => {
        if (studentsData.length === 0) return []
        // We look for the first object that has keys and extract them
        const firstRow = studentsData[0] || {}
        return Object.keys(firstRow)
    }, [studentsData])

    // Assume the first column is the Identifier (Name of the student)
    const idColumn = allColumns[0] || ""

    // Only criteria columns (numbers usually)
    const availableCriteria = useMemo(() => {
        return allColumns.filter(col => col !== idColumn)
    }, [allColumns, idColumn])

    const toggleCriterion = (criterion: string) => {
        setSelectedCriteria(prev =>
            prev.includes(criterion)
                ? prev.filter(c => c !== criterion)
                : [...prev, criterion]
        )
    }

    // Graph Data formatting
    const graphData = useMemo(() => {
        if (!selectedCriteria.length || studentsData.length === 0) return []

        return selectedCriteria.map(criterion => {
            let passed = 0
            let failed = 0

            studentsData.forEach(student => {
                const val = parseFloat(student[criterion])
                if (!isNaN(val)) {
                    if (val >= 5.0) passed++
                    else failed++
                } else if (typeof student[criterion] === 'string') {
                    // Just in case grades are "Apto" / "No Apto" or similar String grades
                    const strVal = student[criterion].toLowerCase().trim()
                    if (['apto', 'aprobado', 'si', 'yes', 'superado'].includes(strVal)) passed++
                    else if (['no apto', 'suspenso', 'no', 'np'].includes(strVal)) failed++
                }
            })

            return {
                name: criterion,
                Aprobados: passed,
                Suspendidos: failed
            }
        })
    }, [studentsData, selectedCriteria])

    // Pagination and Filtering for the Table
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return studentsData
        return studentsData.filter(student => {
            const idVal = String(student[idColumn] || "").toLowerCase()
            return idVal.includes(searchTerm.toLowerCase())
        })
    }, [studentsData, searchTerm, idColumn])

    const paginatedStudents = useMemo(() => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE
        return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }, [filteredStudents, page])

    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)

    return (
        <div className="space-y-6 pb-20">
            {/* ---- HEADER NAV ---- */}
            <div className="flex items-center gap-4 py-2 border-b border-gray-100">
                <Link href="/fp-informatica/evaluations" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{evaluation.name}</h1>
                    <div className="flex items-center gap-3 mt-1 text-sm font-medium text-gray-500">
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{evaluation.subject}</span>
                        <span>{evaluation.cycle}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{evaluation.course}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={clearData}
                        disabled={studentsData.length === 0 || isSaving}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4 mr-2" /> Limpiar Datos
                    </Button>
                    <Button
                        onClick={saveChanges}
                        disabled={isSaving || studentsData.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Guardando..." : "Guardar Avances"}
                    </Button>
                </div>
            </div>

            {/* ---- EXCEL UPLOAD ZONE ---- */}
            {studentsData.length === 0 ? (
                <div className="w-full">
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={isUploading}
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 p-12 text-center cursor-pointer hover:bg-indigo-50/60 transition-colors hover:border-indigo-300"
                    >
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <UploadCloud className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Sube el archivo de notas (Excel)</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                            El archivo debe contener el nombre del alumno en la primera columna y los diferentes criterios o de evaluación en las demás cabeceras.
                        </p>
                        <Button className="bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-sm pointer-events-none">
                            Seleccionar Archivo .xlsx
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">

                    {/* ---- CRITERIA SELECTOR ---- */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <CheckSquare className="h-5 w-5 text-indigo-600" />
                            Selección de Criterios (Ejes X)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {availableCriteria.map(crit => {
                                const isSelected = selectedCriteria.includes(crit)
                                return (
                                    <button
                                        key={crit}
                                        onClick={() => toggleCriterion(crit)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors flex items-center gap-2 ${isSelected
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-gray-400" />}
                                        {crit}
                                    </button>
                                )
                            })}
                        </div>
                        {selectedCriteria.length === 0 && (
                            <p className="text-sm text-rose-500 mt-3 font-medium">Selecciona al menos un criterio para habilitar las visualizaciones gráficas.</p>
                        )}
                    </div>

                    {/* ---- VISUALIZATIONS GRID ---- */}
                    {selectedCriteria.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Bar Chart Global */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                                <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                                    Rendimiento Global
                                </h3>
                                <div className="flex-1 w-full min-h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                            <RechartsTooltip
                                                cursor={{ fill: '#F3F4F6' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="Aprobados" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} barSize={40} />
                                            <Bar dataKey="Suspendidos" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Heatmap / Matricial View */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Grip className="h-5 w-5 text-blue-500" />
                                    Mapa de Calor Aprobados/Suspensos
                                </h3>
                                <div className="flex-1 overflow-auto rounded-xl border border-gray-100 bg-gray-50/50 p-2 custom-scrollbar">
                                    <div className="grid gap-1 min-w-max">
                                        {/* Heatmap Header */}
                                        <div className="flex sticky top-0 bg-white z-10 p-1 shadow-sm rounded-md mb-2">
                                            <div className="w-[200px] shrink-0 font-semibold text-xs text-gray-500 uppercase tracking-wider pl-2 py-2">
                                                Alumno
                                            </div>
                                            {selectedCriteria.map(crit => (
                                                <div key={crit} className="w-[80px] shrink-0 text-center font-bold text-[10px] text-gray-600 truncate px-1 py-1 bg-gray-100 rounded mx-0.5 flex items-center justify-center">
                                                    {crit}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Heatmap Rows (Only for the first 50 to avoid massive DOM if huge class, or all) */}
                                        {studentsData.slice(0, 100).map((student, i) => (
                                            <div key={i} className="flex items-center hover:bg-white p-1 rounded transition-colors group">
                                                <div className="w-[200px] shrink-0 text-sm font-medium text-gray-700 truncate pr-4 pl-2">
                                                    {String(student[idColumn] || "Sin Nombre")}
                                                </div>
                                                {selectedCriteria.map(crit => {
                                                    const rawVal = student[crit]
                                                    let isPassed = false
                                                    const numVal = parseFloat(rawVal)

                                                    if (!isNaN(numVal)) {
                                                        isPassed = numVal >= 5.0
                                                    } else if (typeof rawVal === 'string') {
                                                        const clean = rawVal.toLowerCase().trim()
                                                        isPassed = ['apto', 'aprobado', 'si', 'yes', 'superado'].includes(clean)
                                                    }

                                                    return (
                                                        <div
                                                            key={crit}
                                                            className={`w-[80px] shrink-0 h-8 rounded-md mx-0.5 flex items-center justify-center text-xs font-bold border opacity-90 group-hover:opacity-100 transition-opacity ${rawVal === null || rawVal === undefined || rawVal === ''
                                                                ? 'bg-gray-100 border-gray-200 text-gray-400'
                                                                : isPassed
                                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                                    : 'bg-rose-50 border-rose-200 text-rose-700'
                                                                }`}
                                                            title={`${student[idColumn]}: ${rawVal}`}
                                                        >
                                                            {rawVal !== null && rawVal !== undefined && rawVal !== '' ? rawVal : '-'}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-gray-400 font-medium">
                                    Mostrando hasta 100 alumnos. Los paneles interactivos asumen nota {'>='} 5 como aprobado, o palabras clave "Apto/Aprobado".
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ---- DETAILED TABLE VIEW ---- */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-base font-bold text-gray-900">Datos Completos del Excel</h3>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder={`Buscar por ${idColumn}...`}
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setPage(1)
                                    }}
                                    className="pl-9 w-full sm:w-[300px]"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        {allColumns.map(col => (
                                            <th key={col} className="px-6 py-3 whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={allColumns.length} className="px-6 py-8 text-center text-gray-500">
                                                No se encontraron alumnos con ese criterio.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedStudents.map((row, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                {allColumns.map((col, j) => {
                                                    const val = row[col]
                                                    let badgeColor = ""

                                                    // Only colorize if it's one of the selected criteria
                                                    if (selectedCriteria.includes(col)) {
                                                        const numVal = parseFloat(val)
                                                        if (!isNaN(numVal)) {
                                                            badgeColor = numVal >= 5 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                                        } else if (typeof val === 'string') {
                                                            const clean = val.toLowerCase().trim()
                                                            if (['apto', 'aprobado'].includes(clean)) badgeColor = "bg-emerald-100 text-emerald-700"
                                                            else if (['no apto', 'suspenso'].includes(clean)) badgeColor = "bg-rose-100 text-rose-700"
                                                        }
                                                    }

                                                    return (
                                                        <td key={j} className={`px-6 py-3 ${j === 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                            {badgeColor ? (
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
                                                                    {val}
                                                                </span>
                                                            ) : (
                                                                <span className="truncate max-w-[200px] inline-block">{val !== null && val !== undefined ? String(val) : '-'}</span>
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/40">
                                <span className="text-sm text-gray-500">
                                    Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} a {Math.min(page * ITEMS_PER_PAGE, filteredStudents.length)} de {filteredStudents.length}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}
