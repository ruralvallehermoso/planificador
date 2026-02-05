'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { VaultClient } from '@/lib/vault-client'
import { createVaultItem, getVaultItems, checkVaultSetup, setupVault, verifyVaultKey, deleteVaultItem, updateVaultItem, createVaultSection, getVaultSections, deleteVaultSection } from '@/lib/actions/vault'
import { Loader2, Lock, Unlock, Plus, Trash2, Eye, EyeOff, Save, ShieldCheck, PenSquare, ArrowLeft, ExternalLink, FolderPlus, Folder } from 'lucide-react'

export default function VaultPage() {
    const { data: session } = useSession()
    const [masterKey, setMasterKey] = useState<string | null>(null)
    const [passwordInput, setPasswordInput] = useState('')
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [items, setItems] = useState<any[]>([])
    const [sections, setSections] = useState<any[]>([])

    // UI State
    const [isSetupMode, setIsSetupMode] = useState(false)
    const [initialCheckDone, setInitialCheckDone] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null) // Si hay item aquí, estamos editando

    // Section UI State
    const [showNewSectionInput, setShowNewSectionInput] = useState(false)
    const [newSectionTitle, setNewSectionTitle] = useState('')

    // Form State
    const [newItem, setNewItem] = useState({ title: '', category: 'LOGIN', username: '', password: '', notes: '', url: '', sectionId: '' })
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
            loadData()
        }
    }, [masterKey, session?.user?.id])

    async function loadData() {
        if (!session?.user?.id) return

        // Load items
        const resItems = await getVaultItems(session.user.id)
        if (resItems.success) setItems(resItems.data || [])

        // Load sections
        const resSections = await getVaultSections(session.user.id)
        if (resSections.success) setSections(resSections.data || [])
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
                setErrorMsg('Contraseña incorrecta')
            }
        } catch (error) {
            setErrorMsg("Error al procesar la contraseña")
        } finally {
            setIsLoading(false)
        }
    }

    // --- Handlers CRUD Sections ---
    const handleCreateSection = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSectionTitle.trim() || !session?.user?.id) return
        const res = await createVaultSection(session.user.id, newSectionTitle)
        if (res.success) {
            setSections(prev => [...prev, res.data])
            setNewSectionTitle('')
            setShowNewSectionInput(false)
        }
    }

    const handleDeleteSection = async (id: string) => {
        if (!confirm('¿Eliminar sección? Los ítems pasarán a "Sin Sección".')) return
        if (!session?.user?.id) return

        await deleteVaultSection(id, session.user.id)
        // Refresh local state
        setSections(prev => prev.filter(s => s.id !== id))
        // And update items state locally to reflect unassigned? Better reload for simplicity or update locally
        setItems(prev => prev.map(i => i.sectionId === id ? { ...i, sectionId: null } : i))
    }


    // --- Handlers CRUD Items ---

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
                res = await updateVaultItem(editingItem.id, session.user.id, {
                    title: newItem.title,
                    category: newItem.category,
                    encryptedData: finalEncryptedData,
                    sectionId: newItem.sectionId || undefined // Enforce undefined if empty string
                })
            } else {
                res = await createVaultItem({
                    userId: session.user.id,
                    title: newItem.title,
                    category: newItem.category,
                    encryptedDek: 'direct-master-key',
                    encryptedData: finalEncryptedData,
                    sectionId: newItem.sectionId || undefined
                })
            }

            if (res.success) {
                setShowAddForm(false)
                setEditingItem(null)
                setNewItem({ title: '', category: 'LOGIN', username: '', password: '', notes: '', url: '', sectionId: '' })
                loadData()
            } else {
                alert("Error al guardar: " + res.error)
            }
        } catch (error) {
            alert("Error encriptando datos")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (itemId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este secreto?')) return
        if (!session?.user?.id) return
        setIsLoading(true)
        await deleteVaultItem(itemId, session.user.id)
        loadData()
        setIsLoading(false)
    }

    const handleEditClick = (item: any) => {
        const secret = decryptedValues[item.id]
        if (!secret) {
            alert("Debes desencriptar el ítem antes de editar.")
            return
        }
        setEditingItem(item)
        setNewItem({
            title: item.title,
            category: item.category,
            username: secret.username || '',
            password: secret.password || '',
            notes: secret.notes || '',
            url: secret.url || '',
            sectionId: item.sectionId || ''
        })
        setShowAddForm(true)
    }

    const handleDecrypt = async (itemId: string, encryptedDataStr: string) => {
        if (!masterKey) return
        if (decryptedValues[itemId]) {
            const newValues = { ...decryptedValues }; delete newValues[itemId]; setDecryptedValues(newValues)
            return
        }
        try {
            const { active, iv } = JSON.parse(encryptedDataStr)
            const decryptedJson = await VaultClient.decrypt(active, iv, masterKey)
            const secret = JSON.parse(decryptedJson)
            setDecryptedValues(prev => ({ ...prev, [itemId]: secret }))
        } catch (error) {
            console.error("Error decrypting:", error)
            alert("Error de integridad")
        }
    }


    // --- RENDERS ---

    // Group items by section
    const itemsBySection: Record<string, any[]> = { 'uncategorized': [] }
    sections.forEach(s => itemsBySection[s.id] = [])

    items.forEach(item => {
        if (item.sectionId && itemsBySection[item.sectionId]) {
            itemsBySection[item.sectionId].push(item)
        } else {
            itemsBySection['uncategorized'].push(item)
        }
    })


    if (session?.user?.role !== 'ADMIN') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                <div className="bg-red-100 p-4 rounded-full"><Lock className="w-12 h-12 text-red-600" /></div>
                <h1 className="text-2xl font-bold text-slate-900">Acceso Restringido</h1>
                <p className="text-slate-500">Solo administradores.</p>
            </div>
        )
    }
    if (!initialCheckDone) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-400 w-8 h-8" /></div>

    if (isSetupMode) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <ShieldCheck className="w-12 h-12 text-blue-600" />
            <h1 className="text-2xl font-bold">Configura tu Bóveda</h1>
            <form onSubmit={handleSetup} className="flex flex-col gap-4 w-full max-w-sm">
                <input type="password" required className="px-4 py-3 border rounded-lg" placeholder="Contraseña Maestra" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
                <input type="password" required className="px-4 py-3 border rounded-lg" placeholder="Confirmar" value={confirmPasswordInput} onChange={e => setConfirmPasswordInput(e.target.value)} />
                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg">Crear Bóveda</button>
            </form>
        </div>
    )

    if (!masterKey) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <Lock className="w-12 h-12 text-slate-400" />
            <h1 className="text-2xl font-bold">Bóveda Bloqueada</h1>
            <form onSubmit={handleUnlock} className="flex flex-col gap-4 w-full max-w-sm">
                <input type="password" autoFocus className="px-4 py-3 border rounded-lg" placeholder="Contraseña Maestra" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                <button type="submit" disabled={isLoading} className="bg-slate-900 text-white py-3 rounded-lg flex justify-center items-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Desbloquear"}
                </button>
            </form>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Unlock className="text-green-500 w-6 h-6" /> Mi Bóveda
                    </h1>
                    <p className="text-slate-500 text-sm">Sesión segura activa</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setMasterKey(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Bloquear</button>

                    {!showNewSectionInput && (
                        <button onClick={() => setShowNewSectionInput(true)} className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                            <FolderPlus className="w-4 h-4" /> Nueva Sección
                        </button>
                    )}

                    {!showAddForm && (
                        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                            <Plus className="w-4 h-4" /> Nuevo Secreto
                        </button>
                    )}
                </div>
            </div>

            {/* Create Section Input */}
            {showNewSectionInput && (
                <form onSubmit={handleCreateSection} className="flex gap-2 items-center bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in slide-in-from-top-2">
                    <Folder className="w-5 h-5 text-blue-500" />
                    <input autoFocus type="text" placeholder="Nombre de la nueva sección..." className="flex-1 bg-white px-3 py-2 rounded-lg border border-blue-200 outline-none focus:ring-2 ring-blue-500" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} />
                    <button type="button" onClick={() => setShowNewSectionInput(false)} className="text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Crear</button>
                </form>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
                <form onSubmit={handleSaveItem} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 space-y-4">
                    <h3 className="font-semibold text-lg text-slate-800 mb-4">{editingItem ? 'Editar Secreto' : 'Nuevo Secreto'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Standard Fields */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Título</label>
                            <input required className="w-full px-3 py-2 border rounded-lg" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Categoría</label>
                            <select className="w-full px-3 py-2 border rounded-lg bg-white" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                <option value="LOGIN">Login</option>
                                <option value="CARD">Tarjeta</option>
                                <option value="NOTE">Nota</option>
                                <option value="FINANCIAL">Financiero</option>
                                <option value="OTHER">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Sección (Opcional)</label>
                            <select className="w-full px-3 py-2 border rounded-lg bg-white" value={newItem.sectionId} onChange={e => setNewItem({ ...newItem, sectionId: e.target.value })}>
                                <option value="">-- General (Sin Sección) --</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                        </div>

                        {/* Encrypted Fields */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 flex gap-2 items-center">Usuario <Lock className="w-3 h-3 text-slate-300" /></label>
                            <input className="w-full px-3 py-2 border rounded-lg" value={newItem.username} onChange={e => setNewItem({ ...newItem, username: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 flex gap-2 items-center">Contraseña <Lock className="w-3 h-3 text-slate-300" /></label>
                            <input className="w-full px-3 py-2 border rounded-lg" value={newItem.password} onChange={e => setNewItem({ ...newItem, password: e.target.value })} />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-medium text-slate-500 flex gap-2 items-center">URL <Lock className="w-3 h-3 text-slate-300" /></label>
                            <input type="url" className="w-full px-3 py-2 border rounded-lg font-mono text-sm" value={newItem.url} onChange={e => setNewItem({ ...newItem, url: e.target.value })} />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-medium text-slate-500 flex gap-2 items-center">Notas <Lock className="w-3 h-3 text-slate-300" /></label>
                            <textarea className="w-full px-3 py-2 border rounded-lg h-24" value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => { setShowAddForm(false); setEditingItem(null) }} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-8 pb-20">
                {/* 1. SECTIONS */}
                {sections.map(section => {
                    const sectionItems = itemsBySection[section.id] || []
                    return (
                        <div key={section.id} className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                    <Folder className="w-5 h-5 text-blue-600" />
                                    {section.title}
                                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{sectionItems.length}</span>
                                </h2>
                                <button onClick={() => handleDeleteSection(section.id)} className="text-slate-400 hover:text-red-500 p-1 opacity-50 hover:opacity-100 transition-opacity" title="Eliminar Sección">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {sectionItems.length === 0 ? (
                                <p className="text-sm text-slate-400 italic pl-2">Sección vacía...</p>
                            ) : (
                                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {sectionItems.map(item => <VaultItemCard key={item.id} item={item} decryptedValues={decryptedValues} onDecrypt={handleDecrypt} onEdit={handleEditClick} onDelete={handleDelete} />)}
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* 2. UNCATEGORIZED / GENERAL */}
                {itemsBySection['uncategorized'].length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mt-8">
                            <h2 className="text-lg font-bold text-slate-700">General</h2>
                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{itemsBySection['uncategorized'].length}</span>
                        </div>
                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {itemsBySection['uncategorized'].map(item => <VaultItemCard key={item.id} item={item} decryptedValues={decryptedValues} onDecrypt={handleDecrypt} onEdit={handleEditClick} onDelete={handleDelete} />)}
                        </div>
                    </div>
                )}

                {items.length === 0 && sections.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400">Tu bóveda está vacía. ¡Crea una sección o añade un secreto!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function VaultItemCard({ item, decryptedValues, onDecrypt, onEdit, onDelete }: any) {
    const isDecrypted = decryptedValues[item.id]
    const secret = decryptedValues[item.id]

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3 w-full">
                    <div className={`p-2.5 rounded-lg shrink-0 ${isDecrypted ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                        {isDecrypted ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate pr-2">{item.title}</h4>
                        <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">
                            {item.category}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions Bar - Always visible or visible on hover? let's stick to visible cleanly */}
            <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-2">
                <button onClick={() => onDecrypt(item.id, item.encryptedData)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium">
                    {isDecrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {isDecrypted ? 'Ocultar' : 'Ver datos'}
                </button>
                <div className="flex gap-1">
                    <button onClick={() => onEdit(item)} className="p-1.5 text-slate-300 hover:text-amber-500 rounded-md transition-colors"><PenSquare className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Decrypted Content Layer */}
            {isDecrypted && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/50 -mx-4 -mb-4 p-4 rounded-b-xl animate-in fade-in zoom-in-95 duration-200">

                    {secret.url && (
                        <div className="flex items-center justify-between group/link">
                            <a href={secret.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate flex-1 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> {new URL(secret.url).hostname}
                            </a>
                        </div>
                    )}

                    {secret.username && (
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase text-slate-400 font-bold">Usuario</span>
                            <div className="bg-white border border-slate-200 rounded px-2 py-1 text-sm font-mono text-slate-700 select-all">{secret.username}</div>
                        </div>
                    )}

                    {secret.password && (
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase text-slate-400 font-bold">Contraseña</span>
                            <div className="bg-white border border-emerald-200 rounded px-2 py-1 text-sm font-mono text-emerald-700 font-bold select-all break-all">{secret.password}</div>
                        </div>
                    )}

                    {secret.notes && (
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase text-slate-400 font-bold">Notas</span>
                            <p className="text-xs text-slate-600 whitespace-pre-wrap">{secret.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
