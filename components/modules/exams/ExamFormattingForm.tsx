"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ExamFormatting } from "@/lib/actions/exams"
import { Palette, Layout, Type } from "lucide-react"

interface Props {
    data: ExamFormatting
    onChange: (data: ExamFormatting) => void
}

export function ExamFormattingForm({ data, onChange }: Props) {
    const handleChange = (field: keyof ExamFormatting, value: any) => {
        onChange({ ...data, [field]: value })
    }

    return (
        <div className="space-y-6 bg-white p-8 rounded-2xl shadow-md border-l-4 border-l-slate-400 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between border-b pb-4 mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg">
                        <Palette className="h-5 w-5 text-slate-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Formato del Documento</h2>
                </div>
                <div className="bg-slate-50 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-100">
                    Estilo
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Fuente</Label>
                    <Select value={data.font} onValueChange={(v) => handleChange('font', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona fuente" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="font-sans">Sans Serif (Default)</SelectItem>
                            <SelectItem value="font-serif">Serif (Merriweather)</SelectItem>
                            <SelectItem value="font-mono">Mono (JetBrains)</SelectItem>
                            <SelectItem value="font-[Arial]">Arial</SelectItem>
                            <SelectItem value="font-[Verdana]">Verdana</SelectItem>
                            <SelectItem value="font-[Helvetica]">Helvetica</SelectItem>
                            <SelectItem value="font-['Times_New_Roman']">Times New Roman</SelectItem>
                            <SelectItem value="font-[Georgia]">Georgia</SelectItem>
                            <SelectItem value="font-['Courier_New']">Courier New</SelectItem>
                            <SelectItem value="font-['Trebuchet_MS']">Trebuchet MS</SelectItem>
                            <SelectItem value="font-[Impact]">Impact</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Tamaño de letra base</Label>
                    <Select value={data.fontSize} onValueChange={(v) => handleChange('fontSize', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tamaño" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="text-xs">Muy pequeña (12px)</SelectItem>
                            <SelectItem value="text-sm">Pequeña (14px)</SelectItem>
                            <SelectItem value="text-base">Normal (16px)</SelectItem>
                            <SelectItem value="text-lg">Grande (18px)</SelectItem>
                            <SelectItem value="text-xl">Muy grande (20px)</SelectItem>
                            <SelectItem value="text-2xl">Extra grande (24px)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl transition-colors hover:bg-slate-50">
                    <Label htmlFor="bold-titles" className="cursor-pointer font-medium text-slate-700">Títulos en Negrita</Label>
                    <Switch
                        id="bold-titles"
                        checked={data.isBoldTitle}
                        onCheckedChange={(checked) => handleChange('isBoldTitle', checked)}
                        className="data-[state=checked]:bg-indigo-600"
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl transition-colors hover:bg-slate-50">
                    <Label htmlFor="bold-questions" className="cursor-pointer font-medium text-slate-700">Preguntas en Negrita (Defecto)</Label>
                    <Switch
                        id="bold-questions"
                        checked={data.questionsBold ?? true}
                        onCheckedChange={(checked) => handleChange('questionsBold', checked)}
                        className="data-[state=checked]:bg-indigo-600"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Interlineado</Label>
                    <Select value={data.lineHeight} onValueChange={(v) => handleChange('lineHeight', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Interlineado" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="leading-none">Muy compacto</SelectItem>
                            <SelectItem value="leading-tight">Compacto</SelectItem>
                            <SelectItem value="leading-snug">Ajustado</SelectItem>
                            <SelectItem value="leading-normal">Normal</SelectItem>
                            <SelectItem value="leading-relaxed">Relajado</SelectItem>
                            <SelectItem value="leading-loose">Amplio</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Espaciado entre párrafos</Label>
                    <Select value={data.paragraphSpacing} onValueChange={(v) => handleChange('paragraphSpacing', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Espaciado" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="space-y-1">Muy compacto</SelectItem>
                            <SelectItem value="space-y-2">Compacto</SelectItem>
                            <SelectItem value="space-y-3">Reducido</SelectItem>
                            <SelectItem value="space-y-4">Medio</SelectItem>
                            <SelectItem value="space-y-6">Mucha separación</SelectItem>
                            <SelectItem value="space-y-8">Muy separado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t mt-4">
                <div className="space-y-2">
                    <Label>Tamaño Cabecera</Label>
                    <Select value={data.headerSize || 'md'} onValueChange={(v) => handleChange('headerSize', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Normal" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="sm">Compacta</SelectItem>
                            <SelectItem value="md">Normal</SelectItem>
                            <SelectItem value="lg">Grande</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Columnas Info (Parte Derecha)</Label>
                    <Select value={String(data.headerInfoCols || 2)} onValueChange={(v) => handleChange('headerInfoCols', parseInt(v))}>
                        <SelectTrigger>
                            <SelectValue placeholder="2 Columnas" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="2">2 Columnas (Estándar)</SelectItem>
                            <SelectItem value="3">3 Columnas (Más compacto)</SelectItem>
                            <SelectItem value="4">4 Columnas (Una línea)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

    )
}
