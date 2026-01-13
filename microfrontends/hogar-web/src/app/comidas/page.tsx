'use client';

import { useState } from 'react';
import { Search, ChefHat, Clock, Users, Heart, Star, ArrowRight, Sparkles, X } from 'lucide-react';

interface Recipe {
    id: string;
    name: string;
    emoji: string;
    time: string;
    difficulty: 'Fácil' | 'Media' | 'Difícil';
    servings: number;
    tags: string[];
    image: string;
    bgGradient: string;
}

const RECIPES: Recipe[] = [
    {
        id: '1',
        name: 'Tortilla de Patatas',
        emoji: '🥔',
        time: '30m',
        difficulty: 'Media',
        servings: 4,
        tags: ['Clásico', 'Cena'],
        image: 'https://images.unsplash.com/photo-1664472724253-0b6a8a25c3b5?auto=format&fit=crop&q=80&w=300&h=200',
        bgGradient: 'from-amber-100 to-orange-100'
    },
    {
        id: '2',
        name: 'Pasta a la Boloñesa',
        emoji: '🍝',
        time: '45m',
        difficulty: 'Fácil',
        servings: 4,
        tags: ['Niños', 'Comida'],
        image: 'https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&q=80&w=300&h=200',
        bgGradient: 'from-red-100 to-orange-100'
    },
    {
        id: '3',
        name: 'Ensalada César',
        emoji: '🥗',
        time: '15m',
        difficulty: 'Fácil',
        servings: 2,
        tags: ['Ligero', 'Cena'],
        image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=300&h=200',
        bgGradient: 'from-green-100 to-emerald-100'
    },
    {
        id: '4',
        name: 'Pollo al Curry',
        emoji: '🍛',
        time: '40m',
        difficulty: 'Media',
        servings: 4,
        tags: ['Exótico', 'Comida'],
        image: 'https://images.unsplash.com/photo-1631292726023-8060803274ca?auto=format&fit=crop&q=80&w=300&h=200',
        bgGradient: 'from-yellow-100 to-amber-100'
    },
    {
        id: '5',
        name: 'Pancakes Esponjosos',
        emoji: '🥞',
        time: '20m',
        difficulty: 'Fácil',
        servings: 3,
        tags: ['Desayuno', 'Dulce'],
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=300&h=200',
        bgGradient: 'from-pink-100 to-rose-100'
    },
    {
        id: '6',
        name: 'Salmón al Horno',
        emoji: '🐟',
        time: '25m',
        difficulty: 'Fácil',
        servings: 2,
        tags: ['Saludable', 'Cena'],
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300&h=200',
        bgGradient: 'from-blue-100 to-indigo-100'
    }
];

export default function ComidasPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    // Get all unique tags
    const allTags = Array.from(new Set(RECIPES.flatMap(r => r.tags)));

    const filteredRecipes = RECIPES.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = selectedTag ? recipe.tags.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
    });

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">

            {/* Header with Search */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                    Recetario Familiar <ChefHat className="w-10 h-10 text-orange-500" />
                </h1>
                <p className="text-gray-500 mb-8 max-w-2xl">
                    Nuestra colección de platos favoritos para el día a día. ¿Qué vamos a cocinar hoy?
                </p>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar receta (ej: pasta, pollo...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all bg-white/80 backdrop-blur"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${!selectedTag ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            Todas
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedTag === tag ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                        className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden relative"
                    >
                        {/* Background Gradient Decoration */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${recipe.bgGradient} rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

                        <div className="relative">
                            <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative">
                                <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.8
                                </div>
                            </div>

                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
                                    {recipe.name}
                                </h3>
                                <span className="text-2xl filter drop-shadow-sm">{recipe.emoji}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {recipe.time}
                                </div>
                                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                <div className={`font-medium ${recipe.difficulty === 'Fácil' ? 'text-green-600' :
                                        recipe.difficulty === 'Media' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {recipe.difficulty}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {recipe.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal (Simple Implementation) */}
            {selectedRecipe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRecipe(null)}>
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedRecipe(null)}
                            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors z-10"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>

                        <div className="relative h-64 w-full">
                            <img src={selectedRecipe.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                <div>
                                    <h2 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
                                        {selectedRecipe.name}
                                        <span className="text-3xl">{selectedRecipe.emoji}</span>
                                    </h2>
                                    <div className="flex gap-4 text-white/90 font-medium">
                                        <span className="flex items-center gap-1"><Clock className="w-5 h-5" /> {selectedRecipe.time}</span>
                                        <span className="flex items-center gap-1"><Users className="w-5 h-5" /> {selectedRecipe.servings} pers.</span>
                                        <span className="bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-sm border border-white/20">{selectedRecipe.difficulty}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex gap-2 mb-6">
                                <button className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Cocinar hoy
                                </button>
                                <button className="flex-1 bg-indigo-50 text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-100 transition-colors">
                                    Añadir al plan
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-orange-500" />
                                        Ingredientes
                                    </h3>
                                    <ul className="space-y-3 text-gray-600">
                                        <li className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                                            Ingrediente principal 1
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                                            Ingrediente secundario
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                                            Especias y condimentos
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Pasos</h3>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(step => (
                                            <div key={step} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center flex-shrink-0">
                                                    {step}
                                                </div>
                                                <p className="text-sm text-gray-600 pt-1">
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-orange-500/20 transition-all z-40 group">
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>

        </div>
    );
}
