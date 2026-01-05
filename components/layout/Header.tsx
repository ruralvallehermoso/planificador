'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function Header() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState('')

    // Sync internal state with URL query param on load/change
    useEffect(() => {
        setQuery(searchParams.get('q') || '')
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <header className="flex h-16 w-full items-center justify-between border-b bg-white/50 backdrop-blur-xl px-6">
            <div className="flex flex-1 items-center">
                <form onSubmit={handleSearch} className="w-full max-w-lg lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">
                        Buscar
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            id="search"
                            name="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="block w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all shadow-sm"
                            placeholder="Buscar tareas, proyectos..."
                            type="search"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center space-x-4">
                {/* Placeholder for user profile or notifications if needed */}
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                    CT
                </div>
            </div>
        </header>
    )
}

