"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ExamFormatting } from "@/lib/actions/exams"

interface Props {
    data: ExamFormatting
    onChange: (data: ExamFormatting) => void
}

export function ExamFormattingForm({ data, onChange }: Props) {
    const handleChange = (field: keyof ExamFormatting, value: any) => {
        onChange({ ...data, [field]: value })
    }

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold border-b pb-2">3. Formato del Documento</h2>

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

                <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor="bold-titles" className="cursor-pointer">Títulos en Negrita</Label>
                    <Switch
                        id="bold-titles"
                        checked={data.isBoldTitle}
                        onCheckedChange={(checked) => handleChange('isBoldTitle', checked)}
                    />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor="bold-questions" className="cursor-pointer">Preguntas en Negrita (Defecto)</Label>
                    <Switch
                        id="bold-questions"
                        checked={data.questionsBold ?? true}
                        onCheckedChange={(checked) => handleChange('questionsBold', checked)}
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
        </div>
    )
}
