'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Sidebar } from './Sidebar'
import { Suspense } from 'react'
import { UserMenu } from '@/components/auth/UserMenu'

// Routes that should NOT show the sidebar
const PUBLIC_ROUTES = ['/login', '/unauthorized']

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session, status } = useSession()

    // Check if current route is public (no sidebar needed)
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    // Show loading or public routes without sidebar
    if (isPublicRoute || status === 'loading') {
        return <>{children}</>
    }

    // If not authenticated and not on public route, still show content
    // (middleware will handle redirect to login)
    if (!session) {
        return <>{children}</>
    }

    // Authenticated user - show full layout with sidebar
    return (
        <div className="flex h-full overflow-hidden">
            {/* Sidebar */}
            <Suspense fallback={<div className="w-64 h-full bg-white/50 border-r" />}>
                <Sidebar />
            </Suspense>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar with user menu */}
                <header className="relative z-50 flex items-center justify-end h-14 px-6 border-b bg-white/50 backdrop-blur-xl">
                    <UserMenu />
                </header>

                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}
