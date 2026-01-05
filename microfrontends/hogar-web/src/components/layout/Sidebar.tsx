'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Utensils, Calendar, Package } from 'lucide-react';
import clsx from 'clsx';

const NAVIGATION = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Misiones', href: '/misiones', icon: Target },
    { name: 'Comidas', href: '/comidas', icon: Utensils },
    { name: 'Calendario', href: '/calendario', icon: Calendar },
    { name: 'Cosas', href: '/cosas', icon: Package },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    Hogar
                </h1>
                <p className="text-sm text-gray-400">Tu familia organizada</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {NAVIGATION.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                                isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                        >
                            <item.icon className={clsx(
                                'w-5 h-5 transition-colors',
                                isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                            )} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="bg-indigo-50rounded-xl p-4">
                    <p className="text-xs text-center text-gray-400">
                        v1.0.0
                    </p>
                </div>
            </div>
        </aside>
    );
}
