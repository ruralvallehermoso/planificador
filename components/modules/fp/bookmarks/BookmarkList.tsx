"use client"

import { useState } from "react"
import { Folder, Link as LinkIcon, ExternalLink, ChevronDown, ChevronRight, Search, Trash2, Library, X } from "lucide-react"
import type { FpBookmarkFolder, FpBookmark } from "@prisma/client"
import { clearBookmarks, deleteBookmarkFolder, deleteBookmark } from "@/lib/actions/fp-bookmarks"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

type FolderWithBookmarks = FpBookmarkFolder & {
    bookmarks: FpBookmark[]
}

interface BookmarkListProps {
    folders: FolderWithBookmarks[]
}

export function BookmarkList({ folders }: BookmarkListProps) {
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
    const [searchQuery, setSearchQuery] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }))
    }

    // Si hay búsqueda, mostramos todas las coincidencias y expandimos, si no, estado normal
    const filteredFolders = folders.map(folder => {
        const filteredBookmarks = folder.bookmarks.filter(b =>
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.url.toLowerCase().includes(searchQuery.toLowerCase())
        )
        return {
            ...folder,
            bookmarks: filteredBookmarks
        }
    }).filter(folder => folder.bookmarks.length > 0 || folder.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleClearAll = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar TODOS los marcadores? Esta acción no se puede deshacer.")) return

        setIsProcessing(true)
        try {
            const res = await clearBookmarks()
            if (res.success) {
                toast.success(res.message)
                router.refresh()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al limpiar")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDeleteFolder = async (e: React.MouseEvent, folderId: string, folderName: string) => {
        e.stopPropagation()
        if (!confirm(`¿Eliminar la carpeta "${folderName}" y todo su contenido?`)) return

        setIsProcessing(true)
        try {
            const res = await deleteBookmarkFolder(folderId)
            if (res.success) {
                toast.success(res.message)
                router.refresh()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar carpeta")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDeleteBookmark = async (e: React.MouseEvent, bookmarkId: string) => {
        e.preventDefault() // Evita redirigir si el usuario clickea borrar
        e.stopPropagation()

        if (!confirm(`¿Eliminar este enlace permanentemente?`)) return

        setIsProcessing(true)
        try {
            const res = await deleteBookmark(bookmarkId)
            if (res.success) {
                toast.success(res.message)
                router.refresh()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar enlace")
        } finally {
            setIsProcessing(false)
        }
    }

    if (folders.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Library className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin Marcadores</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    Aún no has importado ningún marcador. Utiliza la barra superior para importar el archivo proporcionado por Google Chrome.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar enlace o carpeta..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>

                <button
                    onClick={handleClearAll}
                    disabled={isProcessing}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                    Vaciar todo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {filteredFolders.map((folder) => {
                        // Por defecto expandimos si hay búsqueda, sino miramos el estado
                        const isExpanded = searchQuery ? true : !!expandedFolders[folder.id]

                        return (
                            <li key={folder.id} className="w-full">
                                <div className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => toggleFolder(folder.id)}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900">{folder.name}</h4>
                                            <p className="text-xs text-gray-500">{folder.bookmarks.length} enlaces</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
                                            disabled={isProcessing}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0"
                                            title="Eliminar carpeta y su contenido"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="text-gray-400 p-1">
                                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-slate-50 border-t border-gray-100 p-4">
                                        {folder.bookmarks.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-2">Vacío</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                {folder.bookmarks.map(bookmark => (
                                                    <a
                                                        key={bookmark.id}
                                                        href={bookmark.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group relative flex flex-col p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-left h-full"
                                                        title={bookmark.title}
                                                    >
                                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                                            <div className="flex items-center gap-2 truncate flex-1">
                                                                {bookmark.iconUrl && bookmark.iconUrl.startsWith('data:') ? (
                                                                    <img src={bookmark.iconUrl} alt="" className="w-4 h-4 flex-shrink-0" />
                                                                ) : (
                                                                    <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                )}
                                                                <span className="font-medium text-sm text-gray-900 truncate flex-1 leading-snug">{bookmark.title}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 truncate w-full mt-auto block">
                                                            {bookmark.url.replace(/^https?:\/\/(www\.)?/, '')}
                                                        </span>

                                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => handleDeleteBookmark(e, bookmark.id)}
                                                                disabled={isProcessing}
                                                                className="p-1 bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 rounded shadow-sm"
                                                                title="Eliminar enlace"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>

                {filteredFolders.length === 0 && searchQuery && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No se encontraron resultados para "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    )
}
