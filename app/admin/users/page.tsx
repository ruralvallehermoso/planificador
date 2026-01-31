'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Pencil, Trash2, X, Check, Shield, Eye, EyeOff } from 'lucide-react'

type Role = 'ADMIN' | 'OWNER' | 'TEACHER' | 'FAMILY' | 'CASA_RURAL' | 'EMPLEADO' | 'GUEST' | 'MASTER'

interface User {
    id: string
    email: string
    name: string | null
    role: Role
    canAccessCasaRural: boolean
    canAccessFinanzas: boolean
    canAccessFpInformatica: boolean
    canAccessHogar: boolean
    canAccessMasterUnie: boolean
    createdAt: string
}

interface UserFormData {
    email: string
    password: string
    name: string
    role: Role
    canAccessCasaRural: boolean
    canAccessFinanzas: boolean
    canAccessFpInformatica: boolean
    canAccessHogar: boolean
    canAccessMasterUnie: boolean
}

const ROLES: { value: Role; label: string; color: string }[] = [
    { value: 'ADMIN', label: 'Administrador', color: 'bg-red-100 text-red-700' },
    { value: 'OWNER', label: 'Propietario', color: 'bg-purple-100 text-purple-700' },
    { value: 'TEACHER', label: 'Profesor', color: 'bg-blue-100 text-blue-700' },
    { value: 'MASTER', label: 'Master UNIE', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'FAMILY', label: 'Familia', color: 'bg-green-100 text-green-700' },
    { value: 'CASA_RURAL', label: 'Casa Rural', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'EMPLEADO', label: 'Empleado Casa Rural', color: 'bg-teal-100 text-teal-700' },
    { value: 'GUEST', label: 'Invitado', color: 'bg-slate-100 text-slate-700' },
]

const MODULES = [
    { key: 'canAccessCasaRural', label: 'Casa Rural' },
    { key: 'canAccessFinanzas', label: 'Finanzas' },
    { key: 'canAccessFpInformatica', label: 'FP Informática' },
    { key: 'canAccessHogar', label: 'Hogar' },
    { key: 'canAccessMasterUnie', label: 'Master UNIE' },
]

const emptyFormData: UserFormData = {
    email: '',
    password: '',
    name: '',
    role: 'GUEST',
    canAccessCasaRural: false,
    canAccessFinanzas: false,
    canAccessFpInformatica: false,
    canAccessHogar: false,
    canAccessMasterUnie: false,
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [formData, setFormData] = useState<UserFormData>(emptyFormData)
    const [showPassword, setShowPassword] = useState(false)
    const [saving, setSaving] = useState(false)

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (status === 'loading') return
        if (!session?.user || session.user.role !== 'ADMIN') {
            router.push('/unauthorized')
            return
        }
        fetchUsers()
    }, [session, status, router])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users')
            if (!res.ok) throw new Error('Error al cargar usuarios')
            const data = await res.json()
            setUsers(data)
        } catch (err) {
            setError('Error al cargar la lista de usuarios')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingUser(null)
        setFormData(emptyFormData)
        setShowModal(true)
        setShowPassword(false)
    }

    const openEditModal = (user: User) => {
        setEditingUser(user)
        setFormData({
            email: user.email,
            password: '',
            name: user.name || '',
            role: user.role,
            canAccessCasaRural: user.canAccessCasaRural,
            canAccessFinanzas: user.canAccessFinanzas,
            canAccessFpInformatica: user.canAccessFpInformatica,
            canAccessHogar: user.canAccessHogar,
            canAccessMasterUnie: user.canAccessMasterUnie,
        })
        setShowModal(true)
        setShowPassword(false)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingUser(null)
        setFormData(emptyFormData)
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            const url = editingUser
                ? `/api/admin/users/${editingUser.id}`
                : '/api/admin/users'
            const method = editingUser ? 'PUT' : 'POST'

            const body = editingUser
                ? { ...formData, password: formData.password || undefined }
                : formData

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Error al guardar usuario')
            }

            await fetchUsers()
            closeModal()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Error al eliminar usuario')
            }
            await fetchUsers()
            setDeleteConfirm(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    const getRoleInfo = (role: Role) => ROLES.find(r => r.value === role) || ROLES[4]

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-600" />
                        Administración de Usuarios
                    </h1>
                    <p className="text-slate-500 mt-1">Gestiona usuarios y permisos del sistema</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Users table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Permisos</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Creado</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => {
                            const roleInfo = getRoleInfo(user.role)
                            return (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{user.name || 'Sin nombre'}</p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                                            {roleInfo.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.role === 'ADMIN' ? (
                                                <span className="text-xs text-slate-500">Acceso total</span>
                                            ) : (
                                                <>
                                                    {user.canAccessCasaRural && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">Casa Rural</span>}
                                                    {user.canAccessFinanzas && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">Finanzas</span>}
                                                    {user.canAccessFpInformatica && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">FP</span>}
                                                    {user.canAccessHogar && <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">Hogar</span>}
                                                    {user.canAccessMasterUnie && <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs">UNIE</span>}
                                                    {!user.canAccessCasaRural && !user.canAccessFinanzas && !user.canAccessFpInformatica && !user.canAccessHogar && !user.canAccessMasterUnie && (
                                                        <span className="text-xs text-slate-400">Ninguno</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {user.id !== session?.user?.id && (
                                                deleteConfirm === user.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={deleting}
                                                            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                                            title="Confirmar"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                            title="Cancelar"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(user.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p>No hay usuarios registrados</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="Nombre completo"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Contraseña {editingUser ? '(dejar vacío para mantener)' : '*'}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required={!editingUser}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                >
                                    {ROLES.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Module permissions */}
                            {formData.role !== 'ADMIN' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Permisos por Módulo</label>
                                    <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                        {MODULES.map(mod => (
                                            <label key={mod.key} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData[mod.key as keyof UserFormData] as boolean}
                                                    onChange={e => setFormData({ ...formData, [mod.key]: e.target.checked })}
                                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-slate-700">{mod.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Estos permisos se suman a los permisos base del rol seleccionado.
                                    </p>
                                </div>
                            )}

                            {formData.role === 'ADMIN' && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                                    <strong>Nota:</strong> Los administradores tienen acceso completo a todos los módulos.
                                </div>
                            )}

                            {/* Error in form */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
