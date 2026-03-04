"use client"

import { useState } from "react"
import { Upload, FileCode, Loader2, AlertCircle } from "lucide-react"
import { importChromeBookmarks } from "@/lib/actions/fp-bookmarks"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

export function BookmarkImporter() {
    const [isDragging, setIsDragging] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.html')) {
            toast.error("Por favor, sube un archivo .html válido exportado desde Chrome", {
                icon: <AlertCircle className="w-5 h-5 text-red-500" />
            })
            return
        }

        setIsLoading(true)

        try {
            const content = await file.text()
            const result = await importChromeBookmarks(content)

            if (result.success) {
                toast.success(result.message || "Marcadores importados correctamente")
                router.refresh()
            } else {
                toast.error(result.message || "Error al importar marcadores")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al procesar el archivo")
        } finally {
            setIsLoading(false)
        }
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0])
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
            >
                <input
                    type="file"
                    accept=".html"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={onChange}
                    disabled={isLoading}
                />

                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-white rounded-full shadow-sm">
                        {isLoading ? (
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        ) : (
                            <FileCode className="w-8 h-8 text-indigo-500" />
                        )}
                    </div>

                    <div>
                        <p className="text-lg font-medium text-gray-900">
                            {isLoading ? 'Importando marcadores...' : 'Haz clic o arrastra aquí tu archivo .html'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Debes subir el archivo exportado desde Chrome (Bookmarks &gt; Marcadores y listas &gt; Administrador de marcadores &gt; Exportar)
                        </p>
                    </div>

                    {!isLoading && (
                        <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Seleccionar Archivo
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Nota importante:</p>
                    <p>Al importar un nuevo archivo de marcadores se reemplazarán los marcadores anteriores para evitar duplicados en la base de datos.</p>
                </div>
            </div>
        </div>
    )
}
