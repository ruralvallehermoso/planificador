'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Loader2, Calendar, FileIcon, FolderOpen } from "lucide-react"
import Link from "next/link"
import { deleteSubjectPractice } from "@/app/fp-informatica/subjects/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface PracticeItemActionsProps {
    practice: {
        id: string
        title: string
        deliveryDate: Date | null
        statementLink: string | null
        deliveryFolderLink: string | null
        subjectId: string
    }
}

export function PracticeItemActions({ practice }: PracticeItemActionsProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta práctica?")) return

        setIsDeleting(true)
        const result = await deleteSubjectPractice(practice.id)

        if (result.success) {
            toast.success("Práctica eliminada")
            router.refresh()
        } else {
            toast.error("Error al eliminar la práctica")
            setIsDeleting(false)
        }
    }

    return (
        <div className="p-4 sm:flex items-start justify-between hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0 group">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-gray-900 font-medium">{practice.title}</h3>
                </div>
                {practice.deliveryDate && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3" />
                        <span>Entrega: {new Date(practice.deliveryDate).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {practice.statementLink && (
                    <a
                        href={practice.statementLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50"
                    >
                        <FileIcon className="w-3 h-3" />
                        Enunciado
                    </a>
                )}
                {practice.deliveryFolderLink && (
                    <a
                        href={practice.deliveryFolderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md shadow-sm"
                    >
                        <FolderOpen className="w-3 h-3" />
                        Entrega
                    </a>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/fp-informatica/subjects/${practice.subjectId}/practices/${practice.id}/edit`} className="flex items-center gap-2">
                                <Pencil className="h-4 w-4" />
                                Editar
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
