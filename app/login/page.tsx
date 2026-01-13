'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const searchParams = useSearchParams()
    const router = useRouter()
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            console.log('Attempting sign in...')
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })
            console.log('Sign in result:', result)

            if (result?.error) {
                console.error('Sign in error:', result.error)
                setError('Email o contraseña incorrectos')
                setIsLoading(false)
                return
            }

            if (!result) {
                console.error('Sign in returned null/undefined')
                setError('Error desconocido: el servidor no respondió')
                setIsLoading(false)
                return
            }

            // Force a hard reload to ensure cookies are sent and middleware sees the session
            console.log('Redirecting to:', callbackUrl)
            window.location.href = callbackUrl
        } catch (err) {
            console.error('Sign in exception:', err)
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="tu@email.com"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                        Contraseña
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Iniciando sesión...
                        </>
                    ) : (
                        'Iniciar Sesión'
                    )}
                </button>
            </form>
        </div>
    )
}

function LoginFormFallback() {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl animate-pulse">
            <div className="space-y-6">
                <div className="h-12 bg-white/5 rounded-xl" />
                <div className="h-12 bg-white/5 rounded-xl" />
                <div className="h-12 bg-white/10 rounded-xl" />
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md px-6">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <Image
                            src="/logo.png"
                            alt="Brand Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Planificador</h1>
                    <p className="text-slate-400 mt-2">Inicia sesión para continuar</p>
                </div>

                {/* Login Form with Suspense */}
                <Suspense fallback={<LoginFormFallback />}>
                    <LoginForm />
                </Suspense>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    Sistema de gestión personal
                </p>
            </div>
        </div>
    )
}
