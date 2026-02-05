'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { VaultClient } from '@/lib/vault-client'
import { createVaultItem, getVaultItems, checkVaultSetup, setupVault, verifyVaultKey } from '@/lib/actions/vault'
import { Loader2, Lock, Unlock, Plus, Trash2, Eye, EyeOff, Save, ShieldCheck } from 'lucide-react'

export default function VaultPage() {
    const { data: session } = useSession()
    const [masterKey, setMasterKey] = useState<string | null>(null)
    const [passwordInput, setPasswordInput] = useState('')
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [items, setItems] = useState<any[]>([])

    // UI State
    const [isSetupMode, setIsSetupMode] = useState(false) // Si es true, estamos creando la password por primera vez
    const [initialCheckDone, setInitialCheckDone] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newItem, setNewItem] = useState({ title: '', category: 'LOGIN', username: '', password: '', notes: '' })
    const [decryptedValues, setDecryptedValues] = useState<Record<string, any>>({})
    const [errorMsg, setErrorMsg] = useState('')

    // 1. Verificar si el usuario ya tiene Vault configurado
    useEffect(() => {
        if (session?.user?.id && !initialCheckDone) {
            checkSetup()
        }
    }, [session?.user?.id, initialCheckDone])

    async function checkSetup() {
        if (!session?.user?.id) return
        const res = await checkVaultSetup(session.user.id)
        if (res.success) {
            setIsSetupMode(!res.isSetup) // Si NO está configurado, entramos en modo setup
        }
        setInitialCheckDone(true)
    }

    // Cargar items si ya estamos desbloqueados
    useEffect(() => {
        if (masterKey && session?.user?.id) {
            loadItems()
        }
    }, [masterKey, session?.user?.id])

    async function loadItems() {
        if (!session?.user?.id) return
        const res = await getVaultItems(session.user.id)
        if (res.success) {
            setItems(res.data || [])
        }
    }

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!passwordInput || !confirmPasswordInput || !session?.user?.email || !session?.user?.id) return

        if (passwordInput !== confirmPasswordInput) {
            setErrorMsg('Las contraseñas no coinciden')
            return
        }

        setIsLoading(true)
        setErrorMsg('')

        try {
            // 1. Derivar master key
            const key = await VaultClient.deriveMasterKey(passwordInput, session.user.email)

            // 2. Generar validador
            const validator = await VaultClient.deriveValidator(key)

            // 3. Guardar setup en servidor
            const res = await setupVault(session.user.id, validator)

            if (res.success) {
                setMasterKey(key)
                setIsSetupMode(false)
                setPasswordInput('')
                setConfirmPasswordInput('')
            } else {
                setErrorMsg('Error al guardar configuración')
            }
        } catch (e) {
            console.error(e)
            setErrorMsg('Error criptográfico inesperado')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!passwordInput || !session?.user?.email || !session?.user?.id) return

        setIsLoading(true)
        setErrorMsg('')
        try {
            // 1. Derivar la clave maestra
            const key = await VaultClient.deriveMasterKey(passwordInput, session.user.email)

            // 2. Verificar validador con servidor
            const validator = await VaultClient.deriveValidator(key)
            const validRes = await verifyVaultKey(session.user.id, validator)

            if (validRes.success && validRes.isValid) {
                setMasterKey(key)
                setPasswordInput('')
            } else {
                setErrorMsg('Contraseña incorrecta. Inténtalo de nuevo.')
            }

        } catch (error) {
            console.error("Error unlocking vault:", error)
            setErrorMsg("Error al procesar la contraseña")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!masterKey || !session?.user?.id) return
        setIsLoading(true)

        try {
            const sensitiveData = JSON.stringify({
                username: newItem.username,
                password: newItem.password,
                notes: newItem.notes
            })

            const encryptionResult = await VaultClient.encrypt(sensitiveData, masterKey)
            const finalEncryptedData = JSON.stringify(encryptionResult)

            const res = await createVaultItem({
                userId: session.user.id,
                title: newItem.title,
                category: newItem.category,
                encryptedDek: 'direct-master-key',
                encryptedData: finalEncryptedData
            })

            if (res.success) {
                setShowAddForm(false)
                setNewItem({ title: '', category: 'LOGIN', username: '', password: '', notes: '' })
                loadItems()
            } else {
                alert("Error al guardar: " + res.error)
            }

        } catch (error) {
            console.error(error)
            alert("Error encriptando datos")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDecrypt = async (itemId: string, encryptedDataStr: string) => {
        if (!masterKey) return

        if (decryptedValues[itemId]) {
            const newValues = { ...decryptedValues }
            delete newValues[itemId]
            setDecryptedValues(newValues)
            return
        }

        try {
            const { active, iv } = JSON.parse(encryptedDataStr)
            const decryptedJson = await VaultClient.decrypt(active, iv, masterKey)
            const secret = JSON.parse(decryptedJson)

            setDecryptedValues(prev => ({
                ...prev,
                [itemId]: secret
            }))
        } catch (error) {
            console.error("Error decrypting:", error)
            alert("Error de integridad en los datos.")
        }
    }

    // --- RENDERS ---

    if (!initialCheckDone) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-400 w-8 h-8" /></div>
    }

    // 1. MODO SETUP
    if (isSetupMode) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in">
                <div className="bg-blue-100 p-4 rounded-full">
                    <ShieldCheck className="w-12 h-12 text-blue-600" />
                </div>
                <div className="text-center space-y-2 max-w-md">
                    <h1 className="text-2xl font-bold text-slate-900">Configura tu Bóveda</h1>
                    <p className="text-slate-500 text-sm">
                        Establece una contraseña maestra única.
                        <br /><span className="font-semibold text-rose-500">IMPORTANTE: Si la olvidas, perderás todos tus datos.</span>
                        <br />Nosotros NO podemos recuperarla.
                    </p>
                </div>

                <form onSubmit={handleSetup} className="flex flex-col gap-4 w-full max-w-sm">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 ml-1">Contraseña Maestra</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 ml-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={confirmPasswordInput}
                            onChange={e => setConfirmPasswordInput(e.target.value)}
                        />
                    </div>

                    {errorMsg && <p className="text-red-500 text-sm text-center bg-red-50 py-1 rounded">{errorMsg}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        Crear Bóveda Segura
                    </button>
                </form>
            </div>
        )
    }

    // 2. MODO BLOQUEADO (Unlock)
    if (!masterKey) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in">
                <div className="bg-slate-100 p-4 rounded-full">
                    <Lock className="w-12 h-12 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Bóveda Bloqueada</h1>
                <p className="text-slate-500 max-w-md text-center text-sm">
                    Introduce tu contraseña maestra para desencriptar las llaves en tu dispositivo.
                </p>

                <form onSubmit={handleUnlock} className="flex flex-col gap-4 w-full max-w-sm">
                    <input
                        type="password"
                        placeholder="Contraseña Maestra"
                        className="px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        autoFocus
                    />

                    {errorMsg && <p className="text-red-500 text-sm text-center bg-red-50 py-1 rounded">{errorMsg}</p>}

                    <button
                        type="submit"
                        disabled={!passwordInput || isLoading}
                        className="bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Unlock className="w-5 h-5" />}
                        Desbloquear
                    </button>
                </form>
            </div>
        )
    }

    // 3. MODO DESBLOQUEADO (Dashboard)
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Unlock className="text-green-500 w-6 h-6" />
                        Mi Bóveda
                    </h1>
                    <p className="text-slate-500 text-sm">Sesión desencriptada activa</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setMasterKey(null)}
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Bloquear
                    </button>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Secreto
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleCreateItem} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 space-y-4">
                    {/* ... (Formulario igual que antes) ... */}
                    <h3 className="font-semibold text-lg text-slate-800">Nuevo Secreto</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Título</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Categoría</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none bg-white"
                                value={newItem.category}
                                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                            >
                                <option value="LOGIN">Login</option>
                                <option value="CARD">Tarjeta</option>
                                <option value="NOTE">Nota Segura</option>
                                <option value="FINANCIAL">Financiero</option>
                                <option value="OTHER">Otro</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Usuario / Email</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                                value={newItem.username}
                                onChange={e => setNewItem({ ...newItem, username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Contraseña</label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                                value={newItem.password}
                                onChange={e => setNewItem({ ...newItem, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Notas Adicionales</label>
                        <textarea
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none h-24 resize-none"
                            value={newItem.notes}
                            onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar Encriptado
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {items.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No tienes secretos guardados.
                    </div>
                ) : (
                    items.map(item => {
                        const isDecrypted = decryptedValues[item.id]
                        const secret = decryptedValues[item.id]

                        return (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{item.title}</h4>
                                            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                                {item.category}
                                            </span>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Creado el {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDecrypt(item.id, item.encryptedData)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title={isDecrypted ? "Ocultar" : "Ver Contraseña"}
                                    >
                                        {isDecrypted ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {isDecrypted && (
                                    <div className="mt-4 pt-4 border-t border-slate-50 bg-slate-50/50 -mx-4 -mb-4 px-4 py-4 rounded-b-xl space-y-3">
                                        {secret.username && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Usuario:</span>
                                                <code className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{secret.username}</code>
                                            </div>
                                        )}
                                        {secret.password && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Contraseña:</span>
                                                <code className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-100 font-bold">{secret.password}</code>
                                            </div>
                                        )}
                                        {secret.notes && (
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="text-slate-500 w-full">Notas:</span>
                                                <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 text-xs leading-relaxed">
                                                    {secret.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
