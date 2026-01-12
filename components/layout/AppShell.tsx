'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Sidebar } from './Sidebar'
import { Suspense, useState } from 'react'
import { Menu } from 'lucide-react'

// Routes that should NOT show the sidebar
const PUBLIC_ROUTES = ['/login', '/unauthorized']

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { status } = useSession()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Check if current route is public (no sidebar needed)
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    // Show loading or public routes without sidebar
    if (isPublicRoute || status === 'loading') {
        return <>{children}</>
    }

    // Authenticated user - show full layout with sidebar
    return (
        <div className="flex h-full overflow-hidden">
            {/* Mobile backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Suspense fallback={<div className="hidden md:block w-64 h-full bg-white/50 border-r" />}>
                <Sidebar
                    isMobileOpen={isMobileMenuOpen}
                    onMobileClose={() => setIsMobileMenuOpen(false)}
                />
            </Suspense>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile-only header with hamburger */}
                <header className="relative z-30 flex items-center h-14 px-4 border-b bg-white/50 backdrop-blur-xl md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        aria-label="Abrir menú"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Planificador
                    </span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}
