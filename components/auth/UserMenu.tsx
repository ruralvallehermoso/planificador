'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function UserMenu() {
    const { data: session, status } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (status === 'loading') {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="w-20 h-4 rounded bg-slate-200" />
            </div>
        )
    }

    if (!session?.user) {
        return null
    }

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-red-100 text-red-700',
        OWNER: 'bg-purple-100 text-purple-700',
        TEACHER: 'bg-blue-100 text-blue-700',
        FAMILY: 'bg-green-100 text-green-700',
        GUEST: 'bg-slate-100 text-slate-700',
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                        {session.user.name || session.user.email}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[session.user.role] || roleColors.GUEST}`}>
                        {session.user.role}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    )
}
