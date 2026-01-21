'use client';

import { useState } from 'react';
import { Search, ChefHat, Clock, Users, Plus, Settings, X, ExternalLink, Youtube, Trash2, Pencil } from 'lucide-react';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { FilterManager } from '@/components/recipes/FilterManager';
import { deleteRecipe } from './actions';
import { useRouter } from 'next/navigation';

interface Recipe {
    id: string;
    name: string;
    emoji?: string | null;
    time?: string | null;
    difficulty?: string | null;
    servings?: number | null;
    imageUrl?: string | null;
    recipeUrl?: string | null;
    youtubeUrl?: string | null;
    ingredients?: string | null;
    steps?: string | null;
    notes?: string | null;
    filters: { filter: { id: string; name: string; color: string } }[];
}

interface Filter {
    id: string;
    name: string;
    color: string;
}

interface ComidasClientProps {
    recipes: Recipe[];
    filters: Filter[];
}

function getYoutubeThumbnail(url: string): string | null {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export default function ComidasClient({ recipes, filters }: ComidasClientProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const [showRecipeForm, setShowRecipeForm] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [showFilterManager, setShowFilterManager] = useState(false);

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = selectedFilterId
            ? recipe.filters.some(f => f.filter.id === selectedFilterId)
            : true;
        return matchesSearch && matchesFilter;
    });

    const handleEditRecipe = (recipe: Recipe) => {
        setSelectedRecipe(null);
        setEditingRecipe(recipe);
        setShowRecipeForm(true);
    };

    const handleDeleteRecipe = async (id: string) => {
        if (!confirm('¿Eliminar esta receta?')) return;
        await deleteRecipe(id);
        setSelectedRecipe(null);
        router.refresh();
    };

    const handleNewRecipe = () => {
        setEditingRecipe(null);
        setShowRecipeForm(true);
    };

    const handleCloseForm = () => {
        setShowRecipeForm(false);
        setEditingRecipe(null);
    };

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
                            onClick={() => setSelectedFilterId(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${!selectedFilterId ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            Todas
                        </button>
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedFilterId(filter.id === selectedFilterId ? null : filter.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedFilterId === filter.id ? 'text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                                style={selectedFilterId === filter.id ? { backgroundColor: filter.color } : {}}
                            >
                                {filter.name}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowFilterManager(true)}
                            className="px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                            title="Gestionar filtros"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Recipe Grid */}
            {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onClick={() => setSelectedRecipe(recipe)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {recipes.length === 0 ? 'No hay recetas todavía' : 'No se encontraron recetas'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {recipes.length === 0
                            ? '¡Añade tu primera receta familiar!'
                            : 'Prueba con otros términos de búsqueda o filtros'
                        }
                    </p>
                    <button
                        onClick={handleNewRecipe}
                        className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700"
                    >
                        <Plus className="w-5 h-5 inline mr-2" />
                        Nueva Receta
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRecipe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRecipe(null)}>
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedRecipe(null)}
                            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors z-10"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>

                        {/* Image Header */}
                        <div className="relative h-64 w-full">
                            {(selectedRecipe.youtubeUrl || selectedRecipe.imageUrl) ? (
                                <img
                                    src={selectedRecipe.youtubeUrl
                                        ? getYoutubeThumbnail(selectedRecipe.youtubeUrl) || selectedRecipe.imageUrl || ''
                                        : selectedRecipe.imageUrl || ''
                                    }
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                    <span className="text-8xl">{selectedRecipe.emoji || '🍽️'}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                <div>
                                    <h2 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
                                        {selectedRecipe.name}
                                        {selectedRecipe.emoji && <span className="text-3xl">{selectedRecipe.emoji}</span>}
                                    </h2>
                                    <div className="flex gap-4 text-white/90 font-medium">
                                        {selectedRecipe.time && (
                                            <span className="flex items-center gap-1"><Clock className="w-5 h-5" /> {selectedRecipe.time}</span>
                                        )}
                                        {selectedRecipe.servings && (
                                            <span className="flex items-center gap-1"><Users className="w-5 h-5" /> {selectedRecipe.servings} pers.</span>
                                        )}
                                        {selectedRecipe.difficulty && (
                                            <span className="bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-sm border border-white/20">{selectedRecipe.difficulty}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Actions */}
                            <div className="flex gap-2 mb-6">
                                {selectedRecipe.youtubeUrl && (
                                    <a
                                        href={selectedRecipe.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Youtube className="w-5 h-5" />
                                        Ver Video
                                    </a>
                                )}
                                {selectedRecipe.recipeUrl && (
                                    <a
                                        href={selectedRecipe.recipeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        Ver Receta
                                    </a>
                                )}
                                <button
                                    onClick={() => handleEditRecipe(selectedRecipe)}
                                    className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <Pencil className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                                    className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="grid md:grid-cols-2 gap-8">
                                {selectedRecipe.ingredients && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-orange-500" />
                                            Ingredientes
                                        </h3>
                                        <div className="text-gray-600 whitespace-pre-line">
                                            {selectedRecipe.ingredients}
                                        </div>
                                    </div>
                                )}
                                {selectedRecipe.steps && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Pasos</h3>
                                        <div className="text-gray-600 whitespace-pre-line">
                                            {selectedRecipe.steps}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedRecipe.notes && (
                                <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                                    <h3 className="text-sm font-bold text-amber-800 mb-2">Notas</h3>
                                    <p className="text-amber-700 text-sm">{selectedRecipe.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recipe Form */}
            <RecipeForm
                recipe={editingRecipe}
                open={showRecipeForm}
                onClose={handleCloseForm}
            />

            {/* Filter Manager */}
            <FilterManager
                open={showFilterManager}
                onClose={() => setShowFilterManager(false)}
            />

            {/* Floating Action Button */}
            <button
                onClick={handleNewRecipe}
                className="fixed bottom-8 right-8 bg-orange-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-orange-700 transition-all z-40 group"
            >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
        </div>
    );
}
