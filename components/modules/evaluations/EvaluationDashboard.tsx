"use client"

import { useState, useMemo, useRef } from "react"
import { FpEvaluation } from "@prisma/client"
import { updateFpEvaluationData } from "@/lib/actions/fp-evaluations"
import { read, utils } from "xlsx"
import {
    UploadCloud, Save, BarChart3, Grip, ArrowLeft,
    Search, Trash2, CheckSquare, Square, Filter, X
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LabelList } from "recharts"

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
    const [heatmapSearchTerm, setHeatmapSearchTerm] = useState("")
    const [page, setPage] = useState(1)

    // NEW Filter states for bar clicks
    const [criteriaFilter, setCriteriaFilter] = useState<{ criteria: string, status: 'Aprobados' | 'Suspendidos' } | null>(null)
    const [distributionFilter, setDistributionFilter] = useState<number | null>(null)
    const [raRecoveryFilter, setRaRecoveryFilter] = useState<string | null>(null)
    const [raDistributionFilter, setRaDistributionFilter] = useState<number | null>(null)

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
                const data = utils.sheet_to_json(ws, { defval: null })

                setStudentsData(data)
                setSelectedCriteria([])
                setPage(1)
                setSearchTerm("")
                setHeatmapSearchTerm("")
                setCriteriaFilter(null)
                setDistributionFilter(null)
                setRaRecoveryFilter(null)
                setRaDistributionFilter(null)
            } catch (error) {
                console.error("Error parsing:" + error)
            } finally {
                setIsUploading(false)
                if (fileInputRef.current) fileInputRef.current.value = ""
            }
        }
        reader.readAsBinaryString(file)
    }

    const saveChanges = async () => {
        setIsSaving(true)
        try {
            await updateFpEvaluationData(evaluation.id, studentsData, selectedCriteria)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    const clearData = async () => {
        if (!confirm("¿Deseas eliminar todos los datos almacenados de esta evaluación?")) return
        setStudentsData([])
        setSelectedCriteria([])
        setCriteriaFilter(null)
        setDistributionFilter(null)
        setRaRecoveryFilter(null)
        setRaDistributionFilter(null)
        setSearchTerm("")
        setHeatmapSearchTerm("")
        setIsSaving(true)
        await updateFpEvaluationData(evaluation.id, [], [])
        setIsSaving(false)
    }

    // 3. COMPUTED DATA PROPERTIES
    const allColumns = useMemo(() => Object.keys(studentsData[0] || {}), [studentsData])

    // Find Name and Surname Columns smartly
    const nameColumns = useMemo(() => {
        if (allColumns.length === 0) return []
        const nameKeys = allColumns.filter(k => /nombre|name/i.test(k))
        const surnameKeys = allColumns.filter(k => /apellido|surname/i.test(k))

        if (nameKeys.length > 0 || surnameKeys.length > 0) {
            return Array.from(new Set([...surnameKeys, ...nameKeys]))
        }
        return [allColumns[0]]
    }, [allColumns])

    const getStudentFullName = (student: any) => nameColumns.map(col => student[col]).filter(Boolean).join(" ")

    const availableCriteria = useMemo(() => allColumns.filter(col => !nameColumns.includes(col)), [allColumns, nameColumns])

    const toggleCriterion = (criterion: string) => {
        setSelectedCriteria(prev => {
            const next = prev.includes(criterion) ? prev.filter(c => c !== criterion) : [...prev, criterion]
            if (criteriaFilter && criteriaFilter.criteria === criterion) setCriteriaFilter(null)
            if (distributionFilter !== null) setDistributionFilter(null)
            if (raRecoveryFilter !== null) setRaRecoveryFilter(null)
            if (raDistributionFilter !== null) setRaDistributionFilter(null)
            return next
        })
    }

    // Graph Data formatting
    const graphData = useMemo(() => {
        if (!selectedCriteria.length || studentsData.length === 0) return []

        return selectedCriteria.map(criterion => {
            let passed = 0, failed = 0

            studentsData.forEach(student => {
                const val = parseFloat(student[criterion])
                if (!isNaN(val)) val >= 5.0 ? passed++ : failed++
                else if (typeof student[criterion] === 'string') {
                    const str = student[criterion].toLowerCase().trim()
                    if (['apto', 'aprobado', 'si', 'yes', 'superado'].includes(str)) passed++
                    else if (['no apto', 'suspenso', 'no', 'np'].includes(str)) failed++
                }
            })

            return { name: criterion, Aprobados: passed, Suspendidos: failed }
        })
    }, [studentsData, selectedCriteria])

    // Distribution Data formatting
    const failsDistributionData = useMemo(() => {
        if (!selectedCriteria.length || studentsData.length === 0) return []

        const counts: Record<number, number> = {}
        for (let i = 0; i <= selectedCriteria.length; i++) counts[i] = 0

        studentsData.forEach(student => {
            let fails = 0
            selectedCriteria.forEach(crit => {
                const rawVal = student[crit]
                let isPassed = false
                const numVal = parseFloat(rawVal)
                if (!isNaN(numVal)) isPassed = numVal >= 5.0
                else if (typeof rawVal === 'string') {
                    const str = rawVal.toLowerCase().trim()
                    isPassed = ['apto', 'aprobado', 'si', 'yes', 'superado'].includes(str)
                }
                if (rawVal === null || rawVal === undefined || rawVal === '') isPassed = false
                if (!isPassed) fails++
            })
            counts[fails]++
        })

        return Object.entries(counts)
            .filter(([fails, count]) => count > 0 || fails === '0')
            .map(([fails, count]) => ({
                name: fails === '0' ? 'Pleno' : `${fails} susp.`,
                fullName: fails === '0' ? 'Todo Aprobado' : `${fails} criterios suspensos`,
                Alumnos: count,
                failsCount: parseInt(fails)
            }))
    }, [studentsData, selectedCriteria])

    // RA Recovery Data - groups criteria by RA prefix and counts students needing recovery
    const raGroupsMap = useMemo(() => {
        if (!selectedCriteria.length) return {} as Record<string, string[]>

        const raGroups: Record<string, string[]> = {}
        selectedCriteria.forEach(crit => {
            const match = crit.match(/RA\d+/i)
            const raKey = match ? match[0].toUpperCase() : crit
            if (!raGroups[raKey]) raGroups[raKey] = []
            raGroups[raKey].push(crit)
        })
        return raGroups
    }, [selectedCriteria])

    const raRecoveryData = useMemo(() => {
        if (!selectedCriteria.length || studentsData.length === 0 || Object.keys(raGroupsMap).length === 0) return []

        return Object.entries(raGroupsMap).map(([ra, criteria]) => {
            let needsRecovery = 0
            let allPassed = 0

            studentsData.forEach(student => {
                let hasFailInRA = false
                criteria.forEach(crit => {
                    const rawVal = student[crit]
                    let isPassed = false
                    const numVal = parseFloat(rawVal)
                    if (!isNaN(numVal)) isPassed = numVal >= 5.0
                    else if (typeof rawVal === 'string') {
                        const str = rawVal.toLowerCase().trim()
                        isPassed = ['apto', 'aprobado', 'si', 'yes', 'superado'].includes(str)
                    }
                    if (rawVal === null || rawVal === undefined || rawVal === '') isPassed = false
                    if (!isPassed) hasFailInRA = true
                })
                if (hasFailInRA) needsRecovery++
                else allPassed++
            })

            return { name: ra, Recuperar: needsRecovery, Aprobados: allPassed }
        }).sort((a, b) => {
            const numA = parseInt(a.name.replace(/\D/g, '')) || 0
            const numB = parseInt(b.name.replace(/\D/g, '')) || 0
            return numA - numB
        })
    }, [studentsData, selectedCriteria, raGroupsMap])

    // Distribution of students by number of RAs failed
    const raFailsDistributionData = useMemo(() => {
        if (!selectedCriteria.length || studentsData.length === 0 || Object.keys(raGroupsMap).length === 0) return []

        const raKeys = Object.keys(raGroupsMap)
        const counts: Record<number, number> = {}
        for (let i = 0; i <= raKeys.length; i++) counts[i] = 0

        studentsData.forEach(student => {
            let failedRAs = 0
            raKeys.forEach(ra => {
                const criteria = raGroupsMap[ra]
                let hasFailInRA = false
                criteria.forEach(crit => {
                    const rawVal = student[crit]
                    let isPassed = false
                    const numVal = parseFloat(rawVal)
                    if (!isNaN(numVal)) isPassed = numVal >= 5.0
                    else if (typeof rawVal === 'string') {
                        const str = rawVal.toLowerCase().trim()
                        isPassed = ['apto', 'aprobado', 'si', 'yes', 'superado'].includes(str)
                    }
                    if (rawVal === null || rawVal === undefined || rawVal === '') isPassed = false
                    if (!isPassed) hasFailInRA = true
                })
                if (hasFailInRA) failedRAs++
            })
            counts[failedRAs]++
        })

        return Object.entries(counts)
            .filter(([fails, count]) => count > 0 || fails === '0')
            .map(([fails, count]) => ({
                name: fails === '0' ? 'Pleno' : `${fails} RA`,
                fullName: fails === '0' ? 'Todos los RA aprobados' : `${fails} RA suspendidos`,
                Alumnos: count,
                failsCount: parseInt(fails)
            }))
    }, [studentsData, selectedCriteria, raGroupsMap])

    // Pagination and Filtering for the Table
    const filteredStudents = useMemo(() => {
        let result = studentsData

        if (searchTerm) {
            result = result.filter(student => getStudentFullName(student).toLowerCase().includes(searchTerm.toLowerCase()))
        }

        if (criteriaFilter) {
            result = result.filter(student => {
                const rawVal = student[criteriaFilter.criteria]
                let isPassed = false
                const numVal = parseFloat(rawVal)
                if (!isNaN(numVal)) isPassed = numVal >= 5.0
                else if (typeof rawVal === 'string') {
                    const str = rawVal.toLowerCase().trim()
                    isPassed = ['apto', 'aprobado', 'si', 'yes', 'superado'].includes(str)
                }
                return criteriaFilter.status === 'Aprobados' ? isPassed : (!isPassed)
            })
        }

        if (distributionFilter !== null) {
            result = result.filter(student => {
                let fails = 0
                selectedCriteria.forEach(crit => {
                    const rawVal = student[crit]
                    let isPassed = false
                    const numVal = parseFloat(rawVal)
                    if (!isNaN(numVal)) isPassed = numVal >= 5.0
                    else if (typeof rawVal === 'string') {
                        const str = rawVal.toLowerCase().trim()
                        isPassed = ['apto', 'aprobado', 'si', 'yes', 'superado'].includes(str)
                    }
                    if (rawVal === null || rawVal === undefined || rawVal === '') isPassed = false
                    if (!isPassed) fails++
                })
                return fails === distributionFilter
            })
        }

        if (raRecoveryFilter) {
            const raCriteria = raGroupsMap[raRecoveryFilter]
            if (raCriteria) {
                result = result.filter(student => {
                    let hasFailInRA = false
                    raCriteria.forEach(crit => {
                        const rawVal = student[crit]
                        let isPassed = false
                        const numVal = parseFloat(rawVal)
                        if (!isNaN(numVal)) isPassed = numVal >= 5.0
                        else if (typeof rawVal === 'string') {
                            const str = rawVal.toLowerCase().trim()
                            isPassed = ['apto', 'aprobado', 'si', 'yes', 'superado'].includes(str)
                        }
                        if (rawVal === null || rawVal === undefined || rawVal === '') isPassed = false
                        if (!isPassed) hasFailInRA = true
                    })
                    return hasFailInRA
                })
            }
        }

        if (raDistributionFilter !== null) {
            const raKeys = Object.keys(raGroupsMap)
            result = result.filter(student => {
                let failedRAs = 0
                raKeys.forEach(ra => {
                    const criteria = raGroupsMap[ra]
                    let hasFailInRA = false
                    criteria.forEach(crit => {
                        const rawVal = student[crit]
                        let isPassed = false
                        const numVal = parseFloat(rawVal)
                        if (!isNaN(numVal)) isPassed = numVal >= 5.0
                        else if (typeof rawVal === 'string') {
                            const str = rawVal.toLowerCase().trim()
                            isPassed = ['apto', 'aprobado', 'si', 'yes', 'superado'].includes(str)
                        }
                        if (rawVal === null || rawVal === undefined || rawVal === '') isPassed = false
                        if (!isPassed) hasFailInRA = true
                    })
                    if (hasFailInRA) failedRAs++
                })
                return failedRAs === raDistributionFilter
            })
        }

        return result
    }, [studentsData, searchTerm, nameColumns, criteriaFilter, distributionFilter, raRecoveryFilter, raDistributionFilter, selectedCriteria, raGroupsMap])

    const filteredHeatmapStudents = useMemo(() => {
        if (!heatmapSearchTerm) return studentsData;
        return studentsData.filter(student => getStudentFullName(student).toLowerCase().includes(heatmapSearchTerm.toLowerCase()))
    }, [studentsData, heatmapSearchTerm, nameColumns])

    const paginatedStudents = useMemo(() => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE
        return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }, [filteredStudents, page])

    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)

    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const resultAprobados = payload.find((p: any) => p.dataKey === 'Aprobados')
            const resultSuspendidos = payload.find((p: any) => p.dataKey === 'Suspendidos')

            const aprobados = resultAprobados?.value || 0
            const suspendidos = resultSuspendidos?.value || 0
            const total = aprobados + suspendidos

            const pctAprobados = total > 0 ? ((aprobados / total) * 100).toFixed(1) : "0.0"
            const pctSuspendidos = total > 0 ? ((suspendidos / total) * 100).toFixed(1) : "0.0"

            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm min-w-[180px]">
                    <p className="font-bold text-gray-800 mb-3">{label}</p>
                    <div className="flex justify-between items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                            <span className="text-gray-600 font-medium">Aprobados</span>
                        </div>
                        <span className="font-bold text-gray-900">{aprobados} <span className="text-gray-400 font-normal text-xs ml-1">({pctAprobados}%)</span></span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-rose-500"></div>
                            <span className="text-gray-600 font-medium">Suspendidos</span>
                        </div>
                        <span className="font-bold text-gray-900">{suspendidos} <span className="text-gray-400 font-normal text-xs ml-1">({pctSuspendidos}%)</span></span>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-3 pt-2 border-t border-gray-100 text-center font-semibold text-indigo-500">Click en la barra para filtrar</p>
                </div>
            )
        }
        return null
    }

    const CustomDistributionTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const alumnos = data.Alumnos
            const total = studentsData.length
            const pct = total > 0 ? ((alumnos / total) * 100).toFixed(1) : "0.0"

            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm min-w-[180px]">
                    <p className="font-bold text-gray-800 mb-3">{data.fullName}</p>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
                            <span className="text-gray-600 font-medium">Alumnos</span>
                        </div>
                        <span className="font-bold text-gray-900">{alumnos} <span className="text-gray-400 font-normal text-xs ml-1">({pct}%)</span></span>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-3 pt-2 border-t border-gray-100 text-center font-semibold text-amber-500">Click en la barra para filtrar</p>
                </div>
            )
        }
        return null
    }

    const CustomRARecoveryTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const total = data.Recuperar + data.Aprobados
            const pctRecuperar = total > 0 ? ((data.Recuperar / total) * 100).toFixed(1) : "0.0"
            const pctAprobados = total > 0 ? ((data.Aprobados / total) * 100).toFixed(1) : "0.0"

            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm min-w-[180px]">
                    <p className="font-bold text-gray-800 mb-3">{data.name}</p>
                    <div className="flex justify-between items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                            <span className="text-gray-600 font-medium">Aprobados</span>
                        </div>
                        <span className="font-bold text-gray-900">{data.Aprobados} <span className="text-gray-400 font-normal text-xs ml-1">({pctAprobados}%)</span></span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-rose-500"></div>
                            <span className="text-gray-600 font-medium">Recuperar</span>
                        </div>
                        <span className="font-bold text-gray-900">{data.Recuperar} <span className="text-gray-400 font-normal text-xs ml-1">({pctRecuperar}%)</span></span>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-3 pt-2 border-t border-gray-100 text-center font-semibold text-violet-500">Click en la barra para filtrar</p>
                </div>
            )
        }
        return null
    }

    const CustomRADistributionTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const alumnos = data.Alumnos
            const total = studentsData.length
            const pct = total > 0 ? ((alumnos / total) * 100).toFixed(1) : "0.0"

            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm min-w-[180px]">
                    <p className="font-bold text-gray-800 mb-3">{data.fullName}</p>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-violet-500"></div>
                            <span className="text-gray-600 font-medium">Alumnos</span>
                        </div>
                        <span className="font-bold text-gray-900">{alumnos} <span className="text-gray-400 font-normal text-xs ml-1">({pct}%)</span></span>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-3 pt-2 border-t border-gray-100 text-center font-semibold text-violet-500">Click en la barra para filtrar</p>
                </div>
            )
        }
        return null
    }

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
                            El archivo debe contener los nombres/apellidos en las primeras columnas y los diferentes criterios de evaluación en las demás cabeceras.
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
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors flex items-center gap-2 ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-gray-400" />}
                                        {crit}
                                    </button>
                                )
                            })}
                        </div>
                        {selectedCriteria.length === 0 && <p className="text-sm text-rose-500 mt-3 font-medium">Selecciona al menos un criterio para habilitar gráficas.</p>}
                    </div>

                    {/* ---- VISUALIZATIONS GRID ---- */}
                    {selectedCriteria.length > 0 && (
                        <div className="space-y-6">

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                                {/* Bar Chart Global */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                                    <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-emerald-500" /> Rendimiento Global
                                    </h3>
                                    <div className="flex-1 w-full min-h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                                <Legend wrapperStyle={{ paddingTop: '30px' }} />
                                                <Bar
                                                    dataKey="Aprobados" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} barSize={40}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={(e) => {
                                                        setCriteriaFilter({ criteria: e.name || e.payload?.name || '', status: 'Aprobados' })
                                                        document.getElementById('table-view')?.scrollIntoView({ behavior: 'smooth' })
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="Suspendidos" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={(e) => {
                                                        setCriteriaFilter({ criteria: e.name || e.payload?.name || '', status: 'Suspendidos' })
                                                        document.getElementById('table-view')?.scrollIntoView({ behavior: 'smooth' })
                                                    }}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Distribution Chart */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                                    <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-amber-500" /> Distribución de Suspensos
                                    </h3>
                                    <div className="flex-1 w-full min-h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={failsDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                                <RechartsTooltip content={<CustomDistributionTooltip />} cursor={{ fill: 'transparent' }} />
                                                <Legend wrapperStyle={{ paddingTop: '30px' }} />
                                                <Bar
                                                    dataKey="Alumnos" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={(e) => {
                                                        const failsCount = e.payload?.failsCount
                                                        if (failsCount !== undefined) {
                                                            setDistributionFilter(failsCount)
                                                            setCriteriaFilter(null) // Reset the other filter just in case
                                                            document.getElementById('table-view')?.scrollIntoView({ behavior: 'smooth' })
                                                        }
                                                    }}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* RA Recovery Chart */}
                            {raRecoveryData.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                                    <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-violet-500" /> Recuperación por RA
                                    </h3>
                                    <div className="w-full h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={raRecoveryData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                                <RechartsTooltip content={<CustomRARecoveryTooltip />} cursor={{ fill: 'transparent' }} />
                                                <Legend wrapperStyle={{ paddingTop: '30px' }} />
                                                <Bar
                                                    dataKey="Aprobados" stackId="ra" fill="#10B981" radius={[0, 0, 4, 4]} barSize={40}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={(e) => {
                                                        setRaRecoveryFilter(e.name || e.payload?.name || '')
                                                        setCriteriaFilter(null)
                                                        setDistributionFilter(null)
                                                        setRaDistributionFilter(null)
                                                        document.getElementById('table-view')?.scrollIntoView({ behavior: 'smooth' })
                                                    }}
                                                >
                                                    <LabelList dataKey="Aprobados" position="center" fill="#fff" fontSize={12} fontWeight={700}
                                                        formatter={(v: any) => v > 0 ? v : ''} />
                                                </Bar>
                                                <Bar
                                                    dataKey="Recuperar" stackId="ra" fill="#EF4444" radius={[4, 4, 0, 0]}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={(e) => {
                                                        setRaRecoveryFilter(e.name || e.payload?.name || '')
                                                        setCriteriaFilter(null)
                                                        setDistributionFilter(null)
                                                        setRaDistributionFilter(null)
                                                        document.getElementById('table-view')?.scrollIntoView({ behavior: 'smooth' })
                                                    }}
                                                >
                                                    <LabelList dataKey="Recuperar" position="center" fill="#fff" fontSize={12} fontWeight={700}
                                                        formatter={(v: any) => v > 0 ? v : ''} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* RA Distribution Chart - Total suspensos por nº de RAs */}
                            {raFailsDistributionData.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-violet-500" /> Suspensos por Nº de RA
                                        </h3>
                                        {(() => {
                                            const totalConAlMenosUnRA = raFailsDistributionData
                                                .filter(d => d.failsCount > 0)
                                                .reduce((sum, d) => sum + d.Alumnos, 0)
                                            const pct = studentsData.length > 0 ? ((totalConAlMenosUnRA / studentsData.length) * 100).toFixed(1) : '0'
                                            return (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg">
                                                    <span className="text-sm font-bold text-rose-700">{totalConAlMenosUnRA}</span>
                                                    <span className="text-xs text-rose-500">con ≥1 RA susp. ({pct}%)</span>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                    <div className="w-full h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={raFailsDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                                <RechartsTooltip content={<CustomRADistributionTooltip />} cursor={{ fill: 'transparent' }} />
                                                <Legend wrapperStyle={{ paddingTop: '30px' }} />
                                                <Bar
                                                    dataKey="Alumnos" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={(e) => {
                                                        const failsCount = e.payload?.failsCount
                                                        if (failsCount !== undefined) {
                                                            setRaDistributionFilter(failsCount)
                                                            setCriteriaFilter(null)
                                                            setDistributionFilter(null)
                                                            setRaRecoveryFilter(null)
                                                            document.getElementById('table-view')?.scrollIntoView({ behavior: 'smooth' })
                                                        }
                                                    }}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Heatmap / Matricial View */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <Grip className="h-5 w-5 text-blue-500" /> Mapa de Calor Aprobados/Suspensos
                                    </h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                        <Input
                                            placeholder="Buscar en el mapa..."
                                            value={heatmapSearchTerm}
                                            onChange={(e) => setHeatmapSearchTerm(e.target.value)}
                                            className="pl-8 h-9 text-sm w-full sm:w-[220px] bg-gray-50 border-gray-200"
                                        />
                                        {heatmapSearchTerm && (
                                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setHeatmapSearchTerm("")}>
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white custom-scrollbar relative shadow-inner">
                                    <table className="w-full text-left border-collapse min-w-max">
                                        <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
                                            <tr>
                                                <th className="sticky left-0 z-30 bg-gray-50 w-[240px] md:w-[300px] p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b border-gray-200">
                                                    Alumno
                                                </th>
                                                {selectedCriteria.map(crit => (
                                                    <th key={crit} className="p-2 text-center text-[10px] font-bold text-gray-600 w-[70px] border-b border-gray-200 border-l border-gray-100">
                                                        <div className="mx-auto truncate max-w-[65px]" title={crit}>{crit}</div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {filteredHeatmapStudents.length === 0 ? (
                                                <tr>
                                                    <td colSpan={selectedCriteria.length + 1} className="p-8 text-center text-gray-500 text-sm">
                                                        No hay resultados para "{heatmapSearchTerm}"
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredHeatmapStudents.slice(0, 100).map((student, i) => (
                                                    <tr key={i}
                                                        className="group hover:bg-indigo-50/40 cursor-pointer border-b border-gray-100 transition-colors"
                                                        onClick={() => {
                                                            setSearchTerm(getStudentFullName(student)); setPage(1);
                                                            document.getElementById('table-view')?.scrollIntoView({ behavior: 'smooth' })
                                                        }}
                                                    >
                                                        <td className="sticky left-0 z-10 bg-white group-hover:bg-indigo-50/80 p-3 text-sm font-medium text-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors border-r border-gray-100">
                                                            <span className="line-clamp-1" title={getStudentFullName(student)}>{getStudentFullName(student)}</span>
                                                        </td>
                                                        {selectedCriteria.map(crit => {
                                                            const rawVal = student[crit]
                                                            let isPassed = false, isMissing = rawVal === null || rawVal === undefined || rawVal === ''
                                                            const numVal = parseFloat(rawVal)
                                                            if (!isNaN(numVal)) isPassed = numVal >= 5.0
                                                            else if (typeof rawVal === 'string') isPassed = ['apto', 'aprobado', 'si', 'yes', 'superado'].includes(rawVal.toLowerCase().trim())

                                                            let cellColor = isMissing ? "bg-gray-100 border-gray-200 text-gray-400" : isPassed ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"

                                                            return (
                                                                <td key={crit} className="p-1 border-l border-gray-50 align-middle">
                                                                    <div className={`w-[60px] h-7 mx-auto rounded flex items-center justify-center text-[11px] font-bold border opacity-90 group-hover:opacity-100 transition-opacity ${cellColor}`} title={`${getStudentFullName(student)}: ${rawVal}`}>
                                                                        {isMissing ? '-' : rawVal}
                                                                    </div>
                                                                </td>
                                                            )
                                                        })}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-3 text-xs text-gray-400 font-medium flex justify-between">
                                    <span>Click en el alumno para buscarlo en la tabla principal.</span>
                                    <span>Mostrando máx 100 resultados.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ---- DETAILED TABLE VIEW ---- */}
                    <div id="table-view" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden scroll-mt-6">
                        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-base font-bold text-gray-900">Datos Detallados</h3>

                                {criteriaFilter && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700">
                                        <Filter className="h-3 w-3" />
                                        <span>{criteriaFilter.criteria}: {criteriaFilter.status === 'Aprobados' ? 'Aprobados' : 'Suspendidos'}</span>
                                        <button onClick={() => { setCriteriaFilter(null); setPage(1) }} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                {distributionFilter !== null && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-semibold text-amber-700">
                                        <Filter className="h-3 w-3" />
                                        <span>Filtro de Suspensos: {distributionFilter === 0 ? 'Pleno (0)' : distributionFilter}</span>
                                        <button onClick={() => { setDistributionFilter(null); setPage(1) }} className="hover:bg-amber-200 rounded-full p-0.5 transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                {raRecoveryFilter && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-violet-50 border border-violet-100 rounded-full text-xs font-semibold text-violet-700">
                                        <Filter className="h-3 w-3" />
                                        <span>Recuperación: {raRecoveryFilter}</span>
                                        <button onClick={() => { setRaRecoveryFilter(null); setPage(1) }} className="hover:bg-violet-200 rounded-full p-0.5 transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                {raDistributionFilter !== null && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-violet-50 border border-violet-100 rounded-full text-xs font-semibold text-violet-700">
                                        <Filter className="h-3 w-3" />
                                        <span>RA Suspensos: {raDistributionFilter === 0 ? 'Pleno (0)' : raDistributionFilter}</span>
                                        <button onClick={() => { setRaDistributionFilter(null); setPage(1) }} className="hover:bg-violet-200 rounded-full p-0.5 transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder={`Buscar por nombre o apellido...`} value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                                    className="pl-9 w-full md:w-[320px] bg-gray-50 border-gray-200"
                                />
                                {searchTerm && (
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => { setSearchTerm(""); setPage(1) }}>
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        {allColumns.map(col => <th key={col} className="px-6 py-3 whitespace-nowrap">{col}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={allColumns.length} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Search className="h-8 w-8 text-gray-300 mb-3" />
                                                    <p>No se encontraron alumnos bajo estos filtros.</p>
                                                    {(searchTerm || criteriaFilter || distributionFilter !== null || raRecoveryFilter || raDistributionFilter !== null) && (
                                                        <Button variant="link" onClick={() => { setSearchTerm(""); setCriteriaFilter(null); setDistributionFilter(null); setRaRecoveryFilter(null); setRaDistributionFilter(null); setPage(1); }} className="text-indigo-600 mt-2">
                                                            Limpiar todos los filtros
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedStudents.map((row, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                {allColumns.map((col, j) => {
                                                    const val = row[col]
                                                    let badgeColor = ""
                                                    if (selectedCriteria.includes(col)) {
                                                        const numVal = parseFloat(val)
                                                        if (!isNaN(numVal)) badgeColor = numVal >= 5 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                                        else if (typeof val === 'string') {
                                                            const clean = val.toLowerCase().trim()
                                                            if (['apto', 'aprobado'].includes(clean)) badgeColor = "bg-emerald-100 text-emerald-700"
                                                            else if (['no apto', 'suspenso'].includes(clean)) badgeColor = "bg-rose-100 text-rose-700"
                                                        }
                                                    }

                                                    return (
                                                        <td key={j} className={`px-6 py-3 ${nameColumns.includes(col) ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                            {badgeColor ? <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>{val}</span> : <span className="truncate max-w-[200px] inline-block">{val !== null && val !== undefined ? String(val) : '-'}</span>}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/40">
                                <span className="text-sm text-gray-500">
                                    Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} a {Math.min(page * ITEMS_PER_PAGE, filteredStudents.length)} de {filteredStudents.length}
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
