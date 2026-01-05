'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, GraduationCap, BookOpen, Coffee, LayoutDashboard, TrendingUp, BarChart3, ClipboardList, Calculator, ChevronDown, ChevronRight, ChevronLeft, Menu, Search, Shield } from 'lucide-react'
import { clsx } from 'clsx'
import { useState, useEffect, useMemo } from 'react'
import { canAccessModule } from '@/lib/auth/permissions'
import { MODULES, type ModuleName } from '@/lib/auth/config'

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
    module?: ModuleName  // Optional module for permission check
    adminOnly?: boolean  // Only visible to ADMIN role
    children?: { name: string; href: string; icon: React.ElementType }[]
}

const allNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    {
        name: 'Finanzas',
        href: '/finanzas',
        icon: TrendingUp,
        module: MODULES.FINANZAS,
        children: [
            { name: 'Portfolio Master', href: '/finanzas/portfolio', icon: TrendingUp },
            { name: 'Simulador Financiero', href: '/finanzas/simulador', icon: BarChart3 },
        ]
    },
    { name: 'FP Informática', href: '/fp-informatica', icon: GraduationCap, module: MODULES.FP_INFORMATICA },
    { name: 'Master UNIE', href: '/master-unie', icon: BookOpen, module: MODULES.MASTER_UNIE },
    {
        name: 'Casa Rural',
        href: '/casa-rural',
        icon: Home,
        module: MODULES.CASA_RURAL,
        children: [
            { name: 'Tareas', href: '/casa-rural/tareas', icon: ClipboardList },
            { name: 'Contabilidad', href: '/casa-rural/contabilidad', icon: Calculator },
        ]
    },
    { name: 'Hogar', href: '/hogar', icon: Coffee, module: MODULES.HOGAR },
    { name: 'Admin Usuarios', href: '/admin/users', icon: Shield, adminOnly: true },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()

    // Filter navigation based on user permissions
    const navigation = useMemo(() => {
        if (!session?.user) return allNavigation.filter(item => !item.module && !item.adminOnly) // Only show Dashboard if not logged in

        return allNavigation.filter(item => {
            // Admin-only items
            if (item.adminOnly) {
                return session.user.role === 'ADMIN'
            }
            // Items without module restriction are always shown (like Dashboard)
            if (!item.module) return true
            // Check if user can access this module
            return canAccessModule(session.user, item.module)
        })
    }, [session?.user])

    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Initialize expanded items when navigation changes
    useEffect(() => {
        setExpandedItems(navigation.filter(item => item.children).map(item => item.name))
    }, [navigation])

    // Sync search with URL
    useEffect(() => {
        setSearchQuery(searchParams.get('q') || '')
    }, [searchParams])

    // Auto-expand parent when child is active
    useEffect(() => {
        navigation.forEach(item => {
            if (item.children?.some(child => pathname.startsWith(child.href))) {
                if (!expandedItems.includes(item.name)) {
                    setExpandedItems(prev => [...prev, item.name])
                }
            }
        })
    }, [pathname, navigation])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const toggleExpand = (name: string) => {
        setExpandedItems(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        )
    }

    const isItemActive = (item: NavItem) => {
        if (item.children) {
            return item.children.some(child => pathname.startsWith(child.href))
        }
        return pathname === item.href
    }

    return (
        <div className={clsx(
            "flex h-full flex-col border-r bg-white/50 backdrop-blur-xl transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Header */}
            <div className="flex h-14 items-center justify-between px-3 border-b">
                {!isCollapsed && (
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Planificador
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title={isCollapsed ? "Expandir menú" : "Contraer menú"}
                >
                    {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            {/* Search */}
            {!isCollapsed ? (
                <form onSubmit={handleSearch} className="px-3 py-3 border-b">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-md border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                            placeholder="Buscar..."
                            type="search"
                        />
                    </div>
                </form>
            ) : (
                <div className="px-2 py-3 border-b">
                    <Link
                        href="/search"
                        className="flex items-center justify-center p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        title="Buscar"
                    >
                        <Search className="h-5 w-5" />
                    </Link>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-3 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = isItemActive(item)
                    const isExpanded = expandedItems.includes(item.name) && !isCollapsed
                    const hasChildren = item.children && item.children.length > 0

                    return (
                        <div key={item.name}>
                            {hasChildren && !isCollapsed ? (
                                <button
                                    onClick={() => toggleExpand(item.name)}
                                    className={clsx(
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                        'w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors'
                                    )}
                                >
                                    <span className="flex items-center">
                                        <item.icon
                                            className={clsx(
                                                isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500',
                                                'mr-3 h-5 w-5 flex-shrink-0'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </span>
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            ) : (
                                <Link
                                    href={hasChildren && isCollapsed ? item.children![0].href : item.href}
                                    className={clsx(
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        isCollapsed && 'justify-center'
                                    )}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <item.icon
                                        className={clsx(
                                            isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500',
                                            isCollapsed ? 'h-5 w-5' : 'mr-3 h-5 w-5 flex-shrink-0'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {!isCollapsed && item.name}
                                </Link>
                            )}

                            {/* Children submenu */}
                            {hasChildren && isExpanded && (
                                <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                                    {item.children!.map((child) => {
                                        const isChildActive = pathname === child.href
                                        return (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className={clsx(
                                                    isChildActive
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                                                    'group flex items-center rounded-md px-3 py-1.5 text-sm transition-colors'
                                                )}
                                            >
                                                <child.icon
                                                    className={clsx(
                                                        isChildActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                                                        'mr-2 h-4 w-4 flex-shrink-0'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {child.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>
        </div>
    )
}
