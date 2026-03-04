"use client"

import { useState } from "react"
import { Folder, Link as LinkIcon, ExternalLink, ChevronDown, ChevronRight, Search, Trash2, Library } from "lucide-react"
import type { FpBookmarkFolder, FpBookmark } from "@prisma/client"
import { clearBookmarks } from "@/lib/actions/fp-bookmarks"
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
    const [isClearing, setIsClearing] = useState(false)
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

    const handleClear = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar TODOS los marcadores? Esta acción no se puede deshacer.")) return

        setIsClearing(true)
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
            toast.error("Error al limpiar los marcadores")
        } finally {
            setIsClearing(false)
        }
    }

    if (folders.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Library className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin Marcadores</h3>
                <p className="text-gray-500">
                    Aún no has importado ningún marcador. Utiliza el formulario superior para importar tu archivo .html desde Google Chrome.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por título o URL..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <button
                    onClick={handleClear}
                    disabled={isClearing}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                    {isClearing ? 'Borrando...' : 'Borrar todos'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {filteredFolders.map((folder, idx) => {
                        // Por defecto expandimos si hay búsqueda, sino miramos el estado
                        const isExpanded = searchQuery ? true : !!expandedFolders[folder.id]

                        return (
                            <li key={folder.id} className="w-full">
                                <button
                                    onClick={() => toggleFolder(folder.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-gray-900">{folder.name}</h4>
                                            <p className="text-xs text-gray-500">{folder.bookmarks.length} enlaces</p>
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="bg-gray-50 border-t border-gray-100 p-4">
                                        {folder.bookmarks.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">No hay enlaces aquí.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {folder.bookmarks.map(bookmark => (
                                                    <a
                                                        key={bookmark.id}
                                                        href={bookmark.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group flex flex-col p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-left h-full"
                                                        title={bookmark.title}
                                                    >
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <div className="flex items-center gap-2 truncate flex-1">
                                                                {bookmark.iconUrl && bookmark.iconUrl.startsWith('data:') ? (
                                                                    <img src={bookmark.iconUrl} alt="" className="w-4 h-4 flex-shrink-0" />
                                                                ) : (
                                                                    <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                )}
                                                                <span className="font-medium text-sm text-gray-900 truncate flex-1">{bookmark.title}</span>
                                                            </div>
                                                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <span className="text-xs text-gray-500 truncate w-full mt-auto block">
                                                            {bookmark.url.replace(/^https?:\/\/(www\.)?/, '')}
                                                        </span>
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
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron resultados para "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    )
}
