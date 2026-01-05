'use client'

import { useState } from 'react'
import { MoreVertical, Image as ImageIcon, Plus } from 'lucide-react'
import Image from 'next/image'

export function ProjectCard({ project, onUploadImage }: { project: any, onUploadImage: (projectId: string) => void }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
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
                    <div className="absolute bottom-2 right-2 flex space-x-1">
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
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.title}</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-3 flex-1">{project.description}</p>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {project.status || 'PLANNING'}
                    </span>
                    <button
                        onClick={() => onUploadImage(project.id)}
                        className="text-xs text-indigo-600 font-medium hover:text-indigo-800 flex items-center"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Añadir Foto
                    </button>
                </div>
            </div>
        </div>
    )
}
