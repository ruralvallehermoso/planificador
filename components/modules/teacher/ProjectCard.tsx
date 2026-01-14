'use client'

import { useState } from 'react'
import { MoreVertical, Image as ImageIcon, Link as LinkIcon, Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface ProjectCardProps {
    project: any
    onEdit: () => void
    onDelete: () => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow relative">
            <div className="relative h-48 bg-gray-100 items-center justify-center flex">
                {project.images.length > 0 ? (
                    <Image
                        src={project.images[currentImageIndex].url}
                        alt={project.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <ImageIcon className="h-10 w-10 text-gray-300" />
                )}

                {/* Image Controls if multiple */}
                {project.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 flex space-x-1 z-10">
                        {project.images.map((_: any, idx: number) => (
                            <div
                                key={idx}
                                className={`h-1.5 w-1.5 rounded-full cursor-pointer ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                onClick={(e) => { e.preventDefault(); setCurrentImageIndex(idx); }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start relative">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 pr-2">{project.title}</h3>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border py-1">
                                    <button
                                        onClick={() => { setShowMenu(false); onEdit(); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" /> Editar
                                    </button>
                                    <button
                                        onClick={() => { setShowMenu(false); onDelete(); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Eliminar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <p className="mt-2 text-sm text-gray-500 line-clamp-3 mb-4">{project.description}</p>

                {/* Links */}
                {project.links && project.links.length > 0 && (
                    <div className="mt-auto pt-4 space-y-1">
                        {project.links.map((link: any) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-indigo-600 hover:underline bg-indigo-50 px-2 py-1 rounded"
                            >
                                <LinkIcon className="h-3 w-3" />
                                <span className="truncate">{link.title || 'Enlace Drive'}</span>
                            </a>
                        ))}
                    </div>
                )}

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {project.status || 'PLANNING'}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    )
}
