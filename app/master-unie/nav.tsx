'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

export function MasterNav() {
    const pathname = usePathname();

    const links = [
        { href: '/master-unie', label: 'Dashboard' },
        { href: '/master-unie/asignaturas', label: 'Asignaturas' },
        { href: '/master-unie/evaluaciones', label: 'Evaluaciones' },
        { href: '/master-unie/tfm', label: 'TFM' },
        { href: '/master-unie/practicum', label: 'Prácticum' },
    ];

    return (
        <nav className="flex space-x-1 border-b border-gray-200 pb-2 mb-6 overflow-x-auto">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={clsx(
                            'px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                            isActive
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        )}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
