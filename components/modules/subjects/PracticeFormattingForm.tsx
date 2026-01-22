"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export interface PracticeFormatting {
    font: string
    fontSize: string
    lineHeight: string
    paragraphSpacing: string
    isBoldTitle?: boolean
    titleSize?: string
    marginSize?: string
}

export const DEFAULT_PRACTICE_FORMATTING: PracticeFormatting = {
    font: "font-sans",
    fontSize: "text-base",
    lineHeight: "leading-normal",
    paragraphSpacing: "space-y-4",
    isBoldTitle: true,
    titleSize: "text-2xl",
    marginSize: "p-[15mm]"
}

interface Props {
    data: PracticeFormatting
    onChange: (data: PracticeFormatting) => void
}

export function PracticeFormattingForm({ data, onChange }: Props) {
    const handleChange = (field: keyof PracticeFormatting, value: any) => {
        onChange({ ...data, [field]: value })
    }

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold border-b pb-2 text-gray-900">Formato del Documento</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Fuente</Label>
                    <Select value={data.font} onValueChange={(v) => handleChange('font', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona fuente" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="font-sans">Sans Serif (Default)</SelectItem>
                            <SelectItem value="font-serif">Serif (Times)</SelectItem>
                            <SelectItem value="font-mono">Mono</SelectItem>
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
                            <SelectItem value="text-sm">Pequeña (14px)</SelectItem>
                            <SelectItem value="text-base">Normal (16px)</SelectItem>
                            <SelectItem value="text-lg">Grande (18px)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Interlineado</Label>
                    <Select value={data.lineHeight} onValueChange={(v) => handleChange('lineHeight', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Interlineado" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="leading-tight">Compacto</SelectItem>
                            <SelectItem value="leading-normal">Normal</SelectItem>
                            <SelectItem value="leading-relaxed">Relajado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Espaciado Párrafos</Label>
                    <Select value={data.paragraphSpacing} onValueChange={(v) => handleChange('paragraphSpacing', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Espaciado" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="space-y-2">Compacto</SelectItem>
                            <SelectItem value="space-y-4">Normal</SelectItem>
                            <SelectItem value="space-y-6">Amplio</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Tamaño Título</Label>
                    <Select value={data.titleSize || "text-2xl"} onValueChange={(v) => handleChange('titleSize', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tamaño Título" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="text-xl">Pequeño (XL)</SelectItem>
                            <SelectItem value="text-2xl">Normal (2XL)</SelectItem>
                            <SelectItem value="text-3xl">Grande (3XL)</SelectItem>
                            <SelectItem value="text-4xl">Muy Grande (4XL)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Márgenes Impresión</Label>
                    <Select value={data.marginSize || "p-[15mm]"} onValueChange={(v) => handleChange('marginSize', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Margen" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="p-[10mm]">Estrecho (1cm)</SelectItem>
                            <SelectItem value="p-[15mm]">Medio (1.5cm)</SelectItem>
                            <SelectItem value="p-[20mm]">Normal (2cm)</SelectItem>
                            <SelectItem value="p-[25mm]">Ancho (2.5cm)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md col-span-1 md:col-span-2">
                    <Label htmlFor="bold-titles" className="cursor-pointer">Título en Negrita</Label>
                    <Switch
                        id="bold-titles"
                        checked={data.isBoldTitle}
                        onCheckedChange={(checked) => handleChange('isBoldTitle', checked)}
                    />
                </div>
            </div>
        </div>
    )
}
