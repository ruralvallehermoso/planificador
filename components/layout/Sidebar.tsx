'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import {
    Home, GraduationCap, BookOpen, Coffee, LayoutDashboard, TrendingUp, TrendingDown, BarChart3,
    ClipboardList, Calculator, ChevronDown, ChevronRight, ChevronLeft, Menu, Search, Shield, X,
    LogOut, Wallet, Wrench, Users, PiggyBank, Settings, Target, Utensils, Calendar, Package,
    CheckSquare, Clock, CreditCard, DollarSign, FileText, User, Briefcase, Library, Loader2, Zap
} from 'lucide-react'
import { clsx } from 'clsx'
import { useState, useEffect, useMemo, useRef } from 'react'
import { canAccessModule } from '@/lib/auth/permissions'
import { MODULES, type ModuleName } from '@/lib/auth/config'

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
    module?: ModuleName
    adminOnly?: boolean
    children?: { name: string; href: string; icon: React.ElementType }[]
}

interface SidebarProps {
    isMobileOpen?: boolean
    onMobileClose?: () => void
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
            { name: 'Vault (Seguridad)', href: '/finanzas/vault', icon: Shield },
            { name: 'Simulador Financiero', href: '/finanzas/simulador', icon: BarChart3 },
        ]
    },
    {
        name: 'FP Informática',
        href: '/fp-informatica',
        icon: GraduationCap,
        module: MODULES.FP_INFORMATICA,
        children: [
            { name: 'Dashboard', href: '/fp-informatica', icon: LayoutDashboard },
            { name: 'Programación', href: '/fp-informatica/calendar', icon: Calendar },
            { name: 'Asignaturas', href: '/fp-informatica/subjects', icon: Library },
            { name: 'Clases', href: '/fp-informatica/classes', icon: BookOpen },
            { name: 'Exámenes', href: '/fp-informatica/exams', icon: ClipboardList },
            { name: 'Temas Pendientes', href: '/fp-informatica#tasks', icon: Target },

            { name: 'Proyectos', href: '/fp-informatica/projects', icon: Package },
        ]
    },
    {
        name: 'Master UNIE',
        href: '/master-unie',
        icon: BookOpen,
        module: MODULES.MASTER_UNIE,
        children: [
            { name: 'Dashboard', href: '/master-unie', icon: LayoutDashboard },
            { name: 'Asignaturas', href: '/master-unie/asignaturas', icon: BookOpen },
            { name: 'Evaluaciones', href: '/master-unie/evaluaciones', icon: ClipboardList },
            { name: 'TFM', href: '/master-unie/tfm', icon: GraduationCap },
            { name: 'Prácticas', href: '/master-unie/practicum', icon: Wallet },
        ]
    },
    {
        name: 'Casa Rural',
        href: '/casa-rural',
        icon: Home,
        module: MODULES.CASA_RURAL,
        children: [
            { name: 'Dashboard', href: '/casa-rural/contabilidad', icon: LayoutDashboard },
            { name: 'Ingresos', href: '/casa-rural/contabilidad/incomes', icon: Wallet },
            { name: 'Gastos', href: '/casa-rural/contabilidad/expenses', icon: TrendingDown },
            { name: 'Mantenimiento', href: '/casa-rural/contabilidad/maintenance', icon: Wrench },
            { name: 'Empleados', href: '/casa-rural/contabilidad/employees', icon: Users },
            { name: 'SES Hospedajes', href: '/casa-rural/ses-hospedajes', icon: ClipboardList },
            { name: 'Fiscalidad', href: '/casa-rural/contabilidad/fiscality', icon: PiggyBank },
            { name: 'Suministros', href: '/casa-rural/suministros', icon: Zap },
            { name: 'Configuración', href: '/casa-rural/contabilidad/config', icon: Settings },
            { name: 'Tareas', href: '/casa-rural/tareas', icon: ClipboardList },
            { name: 'Actividades', href: '/casa-rural/actividades', icon: ClipboardList },
        ]
    },
    {
        name: 'Hogar',
        href: '/hogar',
        icon: Coffee,
        module: MODULES.HOGAR,
        children: [
            { name: 'Inicio', href: '/hogar', icon: Home },
            { name: 'Tareas', href: '/hogar/tareas', icon: Target },
            { name: 'Comidas', href: '/hogar/comidas', icon: Utensils },
            { name: 'Calendario', href: '/hogar/calendario', icon: Calendar },
            { name: 'Lista Compra', href: '/hogar/lista-compra', icon: Package },
        ]
    },
    { name: 'Admin Usuarios', href: '/admin/users', icon: Shield, adminOnly: true },
]

const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    OWNER: 'bg-purple-100 text-purple-700',
    TEACHER: 'bg-blue-100 text-blue-700',
    FAMILY: 'bg-green-100 text-green-700',
    EMPLEADO: 'bg-orange-100 text-orange-700',
    GUEST: 'bg-slate-100 text-slate-700',
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()

    const navigation = useMemo(() => {
        if (!session?.user) return allNavigation.filter(item => !item.module && !item.adminOnly)

        const filtered = allNavigation.filter(item => {
            if (item.adminOnly) {
                return session.user.role === 'ADMIN'
            }
            if (!item.module) return true
            return canAccessModule(session.user, item.module)
        })

        if (session.user.role === 'EMPLEADO') {
            return filtered.map(item => {
                if (item.name === 'Casa Rural' && item.children) {
                    return {
                        ...item,
                        children: item.children.filter(child =>
                            child.href === '/casa-rural/actividades' ||
                            child.href.startsWith('/casa-rural/ses-hospedajes')
                        )
                    }
                }
                return item
            })
        }

        return filtered
    }, [session?.user])

    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
    const userMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setExpandedItems(navigation.filter(item => item.children).map(item => item.name))
    }, [navigation])

    useEffect(() => {
        setSearchQuery(searchParams.get('q') || '')
    }, [searchParams])

    useEffect(() => {
        navigation.forEach(item => {
            if (item.children?.some(child => pathname.startsWith(child.href))) {
                if (!expandedItems.includes(item.name)) {
                    setExpandedItems(prev => [...prev, item.name])
                }
            }
        })
        // Reset loading state on path change
        setNavigatingTo(null)
    }, [pathname, navigation, searchParams])

    const handleNavigation = (href: string) => {
        if (pathname !== href) {
            setNavigatingTo(href)
        }
    }

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

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

    const userName = session?.user?.name || 'Usuario'
    const userEmail = session?.user?.email || ''
    const userRole = session?.user?.role || 'Guest'

    return (
        <div className={clsx(
            "flex h-full flex-col bg-white shadow-[2px_0_8px_rgba(0,0,0,0.04)] transition-all duration-300",
            isCollapsed ? "w-[72px]" : "w-[260px]",
            "fixed md:relative inset-y-0 left-0 z-50",
            isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            Planificador
                        </span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="relative w-8 h-8">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}

                {/* Mobile close button */}
                <button
                    onClick={onMobileClose}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors md:hidden"
                    aria-label="Cerrar menú"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Desktop collapse button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title={isCollapsed ? "Expandir menú" : "Contraer menú"}
                >
                    {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            {/* Search */}
            {!isCollapsed ? (
                <form onSubmit={handleSearch} className="px-4 py-4">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-full border-0 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 ring-1 ring-inset ring-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Buscar..."
                            type="search"
                        />
                    </div>
                </form>
            ) : (
                <div className="px-3 py-4">
                    <Link
                        href="/search"
                        className="flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Buscar"
                    >
                        <Search className="h-5 w-5" />
                    </Link>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
                {/* Group Label */}
                {!isCollapsed && (
                    <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Módulos
                    </div>
                )}

                <div className="space-y-0.5">
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
                                            'w-full group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 -ml-[3px] pl-[15px]'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <item.icon
                                                className={clsx(
                                                    'h-5 w-5 flex-shrink-0 transition-colors',
                                                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </span>
                                        <ChevronDown className={clsx(
                                            "h-4 w-4 text-gray-400 transition-transform duration-200",
                                            isExpanded ? "rotate-180" : ""
                                        )} />
                                    </button>
                                ) : (
                                    <Link
                                        href={hasChildren && isCollapsed ? item.children![0].href : item.href}
                                        onClick={() => handleNavigation(hasChildren && isCollapsed ? item.children![0].href : item.href)}
                                        className={clsx(
                                            'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative',
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 -ml-[3px] pl-[15px]'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                            isCollapsed && 'justify-center px-2',
                                            navigatingTo === (hasChildren && isCollapsed ? item.children![0].href : item.href) && "bg-blue-50/50 animate-pulse"
                                        )}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        {navigatingTo === (hasChildren && isCollapsed ? item.children![0].href : item.href) ? (
                                            <Loader2
                                                className={clsx(
                                                    'h-5 w-5 flex-shrink-0 animate-spin text-blue-600',
                                                    !isCollapsed && 'mr-3'
                                                )}
                                            />
                                        ) : (
                                            <item.icon
                                                className={clsx(
                                                    'h-5 w-5 flex-shrink-0 transition-colors',
                                                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                                                    !isCollapsed && 'mr-3'
                                                )}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {!isCollapsed && item.name}
                                    </Link>
                                )}

                                {/* Children submenu */}
                                {hasChildren && isExpanded && (
                                    <div className="mt-1 ml-5 space-y-0.5 border-l border-gray-100 pl-4">
                                        {item.children!.map((child) => {
                                            const isChildActive = pathname === child.href
                                            return (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    onClick={() => handleNavigation(child.href)}
                                                    className={clsx(
                                                        'group flex items-center rounded-lg px-3 py-2 text-sm transition-all relative',
                                                        isChildActive
                                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                                                        navigatingTo === child.href && "bg-blue-50/50 animate-pulse"
                                                    )}
                                                >
                                                    {navigatingTo === child.href ? (
                                                        <Loader2
                                                            className="mr-2.5 h-4 w-4 flex-shrink-0 animate-spin text-blue-500"
                                                        />
                                                    ) : (
                                                        <child.icon
                                                            className={clsx(
                                                                'mr-2.5 h-4 w-4 flex-shrink-0 transition-colors',
                                                                isChildActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                                            )}
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    {child.name}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </nav>

            {/* User Profile Section with Dropdown */}
            {!isCollapsed ? (
                <div className="p-4 border-t border-gray-100 relative" ref={userMenuRef}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[userRole] || roleColors.GUEST}`}>
                                {userRole}
                            </span>
                        </div>
                        <ChevronDown className={clsx(
                            "h-4 w-4 text-gray-400 transition-transform",
                            isUserMenuOpen ? "rotate-180" : ""
                        )} />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">{userName}</p>
                                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
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
            ) : (
                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    )
}

