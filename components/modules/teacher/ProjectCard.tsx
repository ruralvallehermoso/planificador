'use client'

import { useState } from 'react'
import { MoreVertical, Image as ImageIcon, Link as LinkIcon, Edit, Trash2, Github, Globe } from 'lucide-react'
import Image from 'next/image'

interface ProjectCardProps {
    project: any
    onEdit: () => void
    onDelete: () => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showMenu, setShowMenu] = useState(false)

    // Strip HTML from description for preview
    const stripHtml = (html: string) => {
        if (!html) return ''
        const tmp = document.createElement("DIV")
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ""
    }

    const descriptionPreview = stripHtml(project.description || '')
    const techStack = project.technologies ? project.technologies.split(',').map((t: string) => t.trim()) : []

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow relative">
            <div className="relative h-48 bg-gray-100 items-center justify-center flex shrink-0">
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
                <div className="flex justify-between items-start relative mb-2">
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

                {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {techStack.slice(0, 3).map((tech: string, i: number) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                {tech}
                            </span>
                        ))}
                        {techStack.length > 3 && <span className="text-xs text-gray-400 self-center">+{techStack.length - 3}</span>}
                    </div>
                )}

                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                    {descriptionPreview}
                </p>

                {/* Primary Actions / Links */}
                <div className="mt-auto space-y-2">
                    <div className="flex gap-2">
                        {project.repositoryUrl && (
                            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                                <Github className="w-3 h-3" /> Repo
                            </a>
                        )}
                        {project.deploymentUrl && (
                            <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                                <Globe className="w-3 h-3" /> Demo
                            </a>
                        )}
                    </div>

                    {/* Additional Links */}
                    {project.links && project.links.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                            {project.links.slice(0, 2).map((link: any) => (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline truncate max-w-[120px]"
                                >
                                    <LinkIcon className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{link.title || 'Enlace'}</span>
                                </a>
                            ))}
                            {project.links.length > 2 && <span className="text-xs text-gray-400">+{project.links.length - 2}</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
