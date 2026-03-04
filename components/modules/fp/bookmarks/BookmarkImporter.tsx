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
            toast.error("Por favor, sube un archivo .html", {
                icon: <AlertCircle className="w-5 h-5 text-red-500" />
            })
            return
        }

        setIsLoading(true)

        try {
            const content = await file.text()
            const result = await importChromeBookmarks(content)

            if (result.success) {
                toast.success(result.message || "Marcadores importados")
                router.refresh()
            } else {
                toast.error(result.message || "Error al importar")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al procesar")
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
        <div
            className={`relative flex items-center justify-between gap-4 p-4 border rounded-xl transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'
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

            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isLoading ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : (
                        <FileCode className="w-5 h-5 text-gray-500" />
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-900">
                        {isLoading ? 'Importando...' : 'Importar HTML de marcadores de Chrome'}
                    </h3>
                    <p className="text-xs text-gray-500 hidden sm:block">Reemplaza tu listado actual. Arrastra o clica aquí.</p>
                </div>
            </div>

            {!isLoading && (
                <div className="flex-shrink-0 text-indigo-600 bg-indigo-50 p-2 rounded-md group">
                    <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                </div>
            )}
        </div>
    )
}
