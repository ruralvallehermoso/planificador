'use client'

import Link from 'next/link'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center px-6">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 mb-6 shadow-lg shadow-red-500/25">
                    <ShieldX className="w-10 h-10 text-white" />
                </div>

                {/* Message */}
                <h1 className="text-4xl font-bold text-white mb-3">Acceso Denegado</h1>
                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                    No tienes permisos para acceder a esta sección. Contacta con el administrador si crees que esto es un error.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Ir al Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                    </button>
                </div>
            </div>
        </div>
    )
}
