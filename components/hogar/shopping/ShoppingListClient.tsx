'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Check, Circle, Trash2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ShoppingItem {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
}

export default function ShoppingListClient() {
    const router = useRouter();
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newItemTitle, setNewItemTitle] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/hogar/shopping');
            if (!res.ok) throw new Error('Failed to fetch shopping items');
            const data = await res.json();
            setItems(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;

        try {
            const res = await fetch('/api/hogar/shopping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newItemTitle }),
            });

            if (!res.ok) throw new Error('Failed to create item');

            const newItem = await res.json();
            setItems([newItem, ...items]);
            setNewItemTitle('');
            router.refresh();
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleToggleItemStatus = async (item: ShoppingItem) => {
        const newCompleted = !item.completed;
        // Optimistic update
        setItems(items.map(i => i.id === item.id ? { ...i, completed: newCompleted } : i));

        try {
            const res = await fetch(`/api/hogar/shopping/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newCompleted }),
            });

            if (!res.ok) {
                // Revert on error
                setItems(items);
                throw new Error('Failed to update item');
            }
            router.refresh();
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleDeleteItem = async (id: string) => {
        // Optimistic delete
        const prevItems = [...items];
        setItems(items.filter(i => i.id !== id));

        try {
            const res = await fetch(`/api/hogar/shopping/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                setItems(prevItems);
                throw new Error('Failed to delete item');
            }
            router.refresh();
        } catch (err: any) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto mt-8">
                <AlertCircle className="w-5 h-5" />
                <p>Error cargando lista de compra: {error}</p>
            </div>
        );
    }

    const pendingItems = items.filter(i => !i.completed);
    const completedItems = items.filter(i => i.completed);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
                    <ShoppingCart className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Lista de la Compra</h1>
                <p className="text-gray-500">
                    Anota lo que necesitas y táchalo al comprarlo.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                    <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                        <span className="text-xl font-bold text-emerald-600">{pendingItems.length}</span>
                        <span className="text-sm text-gray-500 font-medium">Por comprar</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleCreateItem} className="p-4 border-b border-gray-100 bg-gray-50/50 flex">
                    <input
                        type="text"
                        placeholder="Añadir producto... (ej. Leche, Pan)"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-l-2xl border border-r-0 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!newItemTitle.trim()}
                        className="bg-emerald-600 text-white px-6 font-medium rounded-r-2xl hover:bg-emerald-700 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Añadir</span>
                    </button>
                </form>

                <div className="divide-y divide-gray-100">
                    {items.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900 mb-1">Tu lista está vacía</p>
                            <p>¡No necesitas comprar nada por ahora!</p>
                        </div>
                    ) : (
                        <>
                            {/* Pending Items */}
                            {pendingItems.map((item) => (
                                <div key={item.id} className="p-4 flex items-center gap-3 bg-white hover:bg-gray-50/80 transition-colors group">
                                    <button
                                        onClick={() => handleToggleItemStatus(item)}
                                        className="flex-shrink-0 text-gray-300 hover:text-emerald-500 transition-colors"
                                    >
                                        <Circle className="w-7 h-7" />
                                    </button>
                                    <span className="flex-1 text-lg font-medium text-gray-900">
                                        {item.title}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}

                            {/* Completed Items */}
                            {completedItems.length > 0 && pendingItems.length > 0 && (
                                <div className="bg-gray-50 py-2 px-4 border-y border-gray-100">
                                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Completado</span>
                                </div>
                            )}

                            {completedItems.map((item) => (
                                <div key={item.id} className="p-4 flex items-center gap-3 bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                                    <button
                                        onClick={() => handleToggleItemStatus(item)}
                                        className="flex-shrink-0 text-emerald-500 hover:text-gray-400 transition-colors"
                                    >
                                        <Check className="w-7 h-7 bg-emerald-100 rounded-full p-1" />
                                    </button>
                                    <span className="flex-1 text-lg font-medium text-gray-400 line-through">
                                        {item.title}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
