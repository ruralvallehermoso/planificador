'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { deleteSubjectTopic } from "@/app/fp-informatica/subjects/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TopicItemActionsProps {
    topic: {
        id: string
        title: string
        order: number
        materialLink: string | null
        subjectId: string
    }
    index: number
}

export function TopicItemActions({ topic, index }: TopicItemActionsProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("¿Estás seguro de que quieres eliminar este tema?")) return

        setIsDeleting(true)
        const result = await deleteSubjectTopic(topic.id)

        if (result.success) {
            toast.success("Tema eliminado")
            router.refresh()
        } else {
            toast.error("Error al eliminar el tema")
            setIsDeleting(false)
        }
    }

    const handleCardClick = () => {
        router.push(`/fp-informatica/subjects/${topic.subjectId}/topics/${topic.id}/edit`)
    }

    return (
        <div
            onClick={handleCardClick}
            className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                </span>
                <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors">
                    {topic.title}
                </span>
            </div>

            <div className="flex items-center gap-2">
                {topic.materialLink && (
                    <a
                        href={topic.materialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline px-3 py-1.5 bg-blue-50 rounded-full"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Materiales
                    </a>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/fp-informatica/subjects/${topic.subjectId}/topics/${topic.id}/edit`}
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
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
