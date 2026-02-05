'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { VaultClient } from '@/lib/vault-client'
import { createVaultItem, getVaultItems, checkVaultSetup, setupVault, verifyVaultKey, deleteVaultItem, updateVaultItem } from '@/lib/actions/vault'
import { Loader2, Lock, Unlock, Plus, Trash2, Eye, EyeOff, Save, ShieldCheck, PenSquare, ArrowLeft, ExternalLink } from 'lucide-react'

export default function VaultPage() {
    const { data: session } = useSession()
    const [masterKey, setMasterKey] = useState<string | null>(null)
    const [passwordInput, setPasswordInput] = useState('')
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [items, setItems] = useState<any[]>([])

    // UI State
    const [isSetupMode, setIsSetupMode] = useState(false)
    const [initialCheckDone, setInitialCheckDone] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null) // Si hay item aquí, estamos editando

    // Form State
    const [newItem, setNewItem] = useState({ title: '', category: 'LOGIN', username: '', password: '', notes: '', url: '' })
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
            setIsSetupMode(!res.isSetup)
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

    // --- Handlers Setup/Auth ---

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
            const key = await VaultClient.deriveMasterKey(passwordInput, session.user.email)
            const validator = await VaultClient.deriveValidator(key)
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
            const key = await VaultClient.deriveMasterKey(passwordInput, session.user.email)
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

    // --- Handlers CRUD ---

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!masterKey || !session?.user?.id) return
        setIsLoading(true)

        try {
            const sensitiveData = JSON.stringify({
                username: newItem.username,
                password: newItem.password,
                notes: newItem.notes,
                url: newItem.url
            })

            const encryptionResult = await VaultClient.encrypt(sensitiveData, masterKey)
            const finalEncryptedData = JSON.stringify(encryptionResult)

            let res

            if (editingItem) {
                // UPDATE
                res = await updateVaultItem(editingItem.id, session.user.id, {
                    title: newItem.title,
                    category: newItem.category,
                    encryptedData: finalEncryptedData
                })
            } else {
                // CREATE
                res = await createVaultItem({
                    userId: session.user.id,
                    title: newItem.title,
                    category: newItem.category,
                    encryptedDek: 'direct-master-key',
                    encryptedData: finalEncryptedData
                })
            }

            if (res.success) {
                setShowAddForm(false)
                setEditingItem(null)
                setNewItem({ title: '', category: 'LOGIN', username: '', password: '', notes: '', url: '' })
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

    const handleDelete = async (itemId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este secreto? NO se puede deshacer.')) return
        if (!session?.user?.id) return

        setIsLoading(true)
        try {
            const res = await deleteVaultItem(itemId, session.user.id)
            if (res.success) {
                loadItems()
                // Limpiar decrypted cache
                const newDecrypted = { ...decryptedValues }
                delete newDecrypted[itemId]
                setDecryptedValues(newDecrypted)
            } else {
                alert("Error al eliminar: " + res.error)
            }
        } catch (e) {
            console.error(e)
            alert("Error al eliminar")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditClick = (item: any) => {
        // Necesitamos estar seguros de que está desencriptado para rellenar el formulario
        const secret = decryptedValues[item.id]
        if (!secret) {
            alert("Debes desencriptar eitem (icono ojo) antes de editar para poder ver los datos actuales.")
            return
        }

        setEditingItem(item)
        setNewItem({
            title: item.title,
            category: item.category,
            username: secret.username || '',
            password: secret.password || '',
            notes: secret.notes || '',
            url: secret.url || ''
        })
        setShowAddForm(true)
    }

    const handleCancelForm = () => {
        setShowAddForm(false)
        setEditingItem(null)
        setNewItem({ title: '', category: 'LOGIN', username: '', password: '', notes: '', url: '' })
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
                {/* Same setup form as before */}
                <div className="text-center space-y-2 max-w-md">
                    <h1 className="text-2xl font-bold text-slate-900">Configura tu Bóveda</h1>
                    <p className="text-slate-500 text-sm">
                        Establece una contraseña maestra única.
                        <br /><span className="font-semibold text-rose-500">IMPORTANTE: Si la olvidas, perderás todos tus datos.</span>
                    </p>
                </div>
                <form onSubmit={handleSetup} className="flex flex-col gap-4 w-full max-w-sm">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 ml-1">Contraseña Maestra</label>
                        <input type="password" required minLength={6} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 ml-1">Confirmar Contraseña</label>
                        <input type="password" required minLength={6} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" value={confirmPasswordInput} onChange={e => setConfirmPasswordInput(e.target.value)} />
                    </div>
                    {errorMsg && <p className="text-red-500 text-sm text-center bg-red-50 py-1 rounded">{errorMsg}</p>}
                    <button type="submit" disabled={isLoading} className="bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-2">
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        Crear Bóveda Segura
                    </button>
                </form>
            </div>
        )
    }

    // 2. MODO BLOQUEADO
    if (!masterKey) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in">
                <div className="bg-slate-100 p-4 rounded-full">
                    <Lock className="w-12 h-12 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Bóveda Bloqueada</h1>
                <p className="text-slate-500 max-w-md text-center text-sm">Introduce tu contraseña maestra para desencriptar las llaves.</p>
                <form onSubmit={handleUnlock} className="flex flex-col gap-4 w-full max-w-sm">
                    <input type="password" placeholder="Contraseña Maestra" className="px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} autoFocus />
                    {errorMsg && <p className="text-red-500 text-sm text-center bg-red-50 py-1 rounded">{errorMsg}</p>}
                    <button type="submit" disabled={!passwordInput || isLoading} className="bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Unlock className="w-5 h-5" />}
                        Desbloquear
                    </button>
                </form>
            </div>
        )
    }

    // 3. MODO DESBLOQUEADO
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
                    <button onClick={() => setMasterKey(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Bloquear</button>
                    {!showAddForm && (
                        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm">
                            <Plus className="w-4 h-4" />
                            Nuevo Secreto
                        </button>
                    )}
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleSaveItem} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg text-slate-800">{editingItem ? 'Editar Secreto' : 'Nuevo Secreto'}</h3>
                        {editingItem && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Editando</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Título (Visible)</label>
                            <input type="text" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Categoría (Visible)</label>
                            <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none bg-white" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                <option value="LOGIN">Login</option>
                                <option value="CARD">Tarjeta</option>
                                <option value="NOTE">Nota Segura</option>
                                <option value="FINANCIAL">Financiero</option>
                                <option value="OTHER">Otro</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 flex gap-2 items-center">
                                Usuario / Email
                                <Lock className="w-3 h-3 text-slate-300" />
                            </label>
                            <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none" value={newItem.username} onChange={e => setNewItem({ ...newItem, username: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 flex gap-2 items-center">
                                Contraseña
                                <Lock className="w-3 h-3 text-slate-300" />
                            </label>
                            <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none" value={newItem.password} onChange={e => setNewItem({ ...newItem, password: e.target.value })} />
                        </div>

                        {/* URL FIELD */}
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-slate-500 flex gap-2 items-center">
                                URL / Sitio Web
                                <Lock className="w-3 h-3 text-slate-300" />
                            </label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none font-mono text-sm"
                                value={newItem.url}
                                onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex gap-2 items-center">
                            Notas Adicionales
                            <Lock className="w-3 h-3 text-slate-300" />
                        </label>
                        <textarea className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none h-24 resize-none" value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={handleCancelForm} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editingItem ? 'Actualizar Secreto' : 'Guardar Encriptado'}
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
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${isDecrypted ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {isDecrypted ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{item.title}</h4>
                                            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {/* BOTONES ACCIÓN */}
                                        <button
                                            onClick={() => handleDecrypt(item.id, item.encryptedData)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title={isDecrypted ? "Ocultar" : "Ver Contraseña"}
                                        >
                                            {isDecrypted ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>

                                        <div className="w-px h-6 bg-slate-200 my-auto mx-1"></div>

                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <PenSquare className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {isDecrypted && (
                                    <div className="mt-4 pt-4 border-t border-slate-50 bg-slate-50/50 -mx-4 -mb-4 px-4 py-4 rounded-b-xl space-y-3 animate-in slide-in-from-top-2">
                                        {/* URL FIELD DISPLAY */}
                                        {secret.url && (
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-slate-500">URL:</span>
                                                <a
                                                    href={secret.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-blue-100"
                                                >
                                                    {new URL(secret.url).hostname}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}

                                        {secret.username && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Usuario:</span>
                                                <code className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 select-all">{secret.username}</code>
                                            </div>
                                        )}
                                        {secret.password && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Contraseña:</span>
                                                <code className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-100 font-bold select-all font-mono">{secret.password}</code>
                                            </div>
                                        )}
                                        {secret.notes && (
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="text-slate-500 w-full">Notas:</span>
                                                <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
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
