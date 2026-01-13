'use client';

import { useState } from 'react';
import { Plus, Trash2, ShoppingCart, Apple, History, ArrowRight, RotateCcw } from 'lucide-react';

interface ShoppingItem {
    id: string;
    name: string;
    completed: boolean;
}

interface ShoppingList {
    id: string;
    name: string;
    icon: 'cart' | 'food';
    items: ShoppingItem[];
}

interface BacklogItem {
    id: string;
    name: string;
    frequency?: 'often' | 'rarely';
}

export default function ListaCompraPage() {
    const [lists, setLists] = useState<ShoppingList[]>([
        {
            id: 'super',
            name: 'Supermercado',
            icon: 'cart',
            items: [
                { id: '1', name: 'Leche', completed: false },
                { id: '2', name: 'Huevos', completed: true },
                { id: '3', name: 'Pan de molde', completed: false }
            ]
        },
        {
            id: 'fruta',
            name: 'Fruta y Verdura',
            icon: 'food',
            items: [
                { id: '4', name: 'Plátanos', completed: false },
                { id: '5', name: 'Manzanas', completed: false }
            ]
        }
    ]);

    const [activeListId, setActiveListId] = useState<string>('super');
    const [newItemName, setNewItemName] = useState('');
    const [backlog] = useState<BacklogItem[]>([
        { id: 'b1', name: 'Papel Higiénico', frequency: 'often' },
        { id: 'b2', name: 'Aceite de Oliva', frequency: 'rarely' },
        { id: 'b3', name: 'Café', frequency: 'often' },
        { id: 'b4', name: 'Detergente', frequency: 'often' }
    ]);

    const activeList = lists.find(l => l.id === activeListId) || lists[0];

    const addItem = (e: React.FormEvent, name?: string) => {
        e.preventDefault();
        const itemText = name || newItemName;
        if (!itemText.trim()) return;

        const newItem: ShoppingItem = {
            id: Date.now().toString(),
            name: itemText,
            completed: false
        };

        setLists(lists.map(list => {
            if (list.id === activeListId) {
                return { ...list, items: [...list.items, newItem] };
            }
            return list;
        }));

        if (!name) setNewItemName('');
    };

    const toggleItem = (listId: string, itemId: string) => {
        setLists(lists.map(list => {
            if (list.id !== listId) return list;
            return {
                ...list,
                items: list.items.map(item =>
                    item.id === itemId ? { ...item, completed: !item.completed } : item
                )
            };
        }));
    };

    const deleteItem = (listId: string, itemId: string) => {
        setLists(lists.map(list => {
            if (list.id !== listId) return list;
            return {
                ...list,
                items: list.items.filter(i => i.id !== itemId)
            };
        }));
    };

    const clearCompleted = (listId: string) => {
        setLists(lists.map(list => {
            if (list.id !== listId) return list;
            return {
                ...list,
                items: list.items.filter(i => !i.completed)
            };
        }));
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Lista de la Compra 🛒</h1>
                <p className="text-gray-500">No te olvides de nada en el súper.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List Area */}
                <div className="lg:col-span-2 space-y-6">

                    {/* List Selector Tabs */}
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {lists.map(list => (
                            <button
                                key={list.id}
                                onClick={() => setActiveListId(list.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeListId === list.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                                    }`}
                            >
                                {list.icon === 'cart' ? <ShoppingCart className="w-5 h-5" /> : <Apple className="w-5 h-5" />}
                                {list.name}
                                <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${activeListId === list.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                                    {list.items.filter(i => !i.completed).length}
                                </span>
                            </button>
                        ))}
                        <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-50 border border-dashed border-gray-200 hover:border-gray-300 transition-all">
                            <Plus className="w-5 h-5" />
                            Nueva lista
                        </button>
                    </div>

                    {/* Active List Content */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

                        {/* Input Area */}
                        <form onSubmit={addItem} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder={`Añadir a ${activeList.name}...`}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newItemName.trim()}
                                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </form>

                        {/* Items List */}
                        <div className="space-y-1">
                            {activeList.items.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Tu lista está vacía</p>
                                </div>
                            ) : (
                                activeList.items.map(item => (
                                    <div key={item.id} className="group flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" onClick={() => toggleItem(activeList.id, item.id)}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-blue-400'
                                            }`}>
                                            {item.completed && <div className="w-2.5 h-1.5 border-b-2 border-l-2 border-white -rotate-45 mb-0.5" />}
                                        </div>
                                        <span className={`flex-1 font-medium transition-colors ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                            {item.name}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteItem(activeList.id, item.id); }}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Actions */}
                        {activeList.items.some(i => i.completed) && (
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => clearCompleted(activeList.id)}
                                    className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Limpiar completados
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Backlog / History */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <History className="w-5 h-5 text-blue-300" />
                            </div>
                            <h3 className="font-bold text-lg">Habituales & Histórico</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sugerencias Rápidas</h4>
                                <div className="flex flex-wrap gap-2">
                                    {backlog.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={(e) => addItem(e, item.name)}
                                            className="group flex items-center gap-2 bg-white/10 hover:bg-blue-600 hover:text-white text-gray-200 px-3 py-1.5 rounded-lg text-sm transition-all border border-white/5 hover:border-blue-500"
                                        >
                                            {item.name}
                                            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus className="w-3 h-3" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-indigo-900/50 rounded-xl p-4 border border-indigo-500/30">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                                        <RotateCcw className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-indigo-100 mb-1">Reponer Despensa</h4>
                                        <p className="text-xs text-indigo-300/80 mb-3">
                                            Basado en tu consumo, parece que toca reponer básicos.
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                addItem(e, "Aceite");
                                                addItem(e, "Arroz");
                                                addItem(e, "Pasta");
                                            }}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            Añadir Pack Básicos
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
