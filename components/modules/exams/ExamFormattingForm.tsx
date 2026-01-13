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
                        <SelectContent>
                            <SelectItem value="font-sans">Sans Serif (Inter)</SelectItem>
                            <SelectItem value="font-serif">Serif (Merriweather)</SelectItem>
                            <SelectItem value="font-mono">Mono (JetBrains)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Tamaño de letra base</Label>
                    <Select value={data.fontSize} onValueChange={(v) => handleChange('fontSize', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text-sm">Pequeña (14px)</SelectItem>
                            <SelectItem value="text-base">Normal (16px)</SelectItem>
                            <SelectItem value="text-lg">Grande (18px)</SelectItem>
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

                <div className="space-y-2">
                    <Label>Interlineado</Label>
                    <Select value={data.lineHeight} onValueChange={(v) => handleChange('lineHeight', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Interlineado" />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectContent>
                            <SelectItem value="space-y-2">Compacto</SelectItem>
                            <SelectItem value="space-y-4">Medio</SelectItem>
                            <SelectItem value="space-y-6">Mucha separación</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
