'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createRecipe, updateRecipe, getFilters } from '@/app/comidas/actions';
import { useRouter } from 'next/navigation';

interface RecipeFormProps {
    recipe?: {
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
    } | null;
    open: boolean;
    onClose: () => void;
}

interface Filter {
    id: string;
    name: string;
    color: string;
}

export function RecipeForm({ recipe, open, onClose }: RecipeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Filter[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        emoji: '',
        time: '',
        difficulty: '',
        servings: '',
        imageUrl: '',
        recipeUrl: '',
        youtubeUrl: '',
        ingredients: '',
        steps: '',
        notes: '',
        filterIds: [] as string[]
    });

    useEffect(() => {
        if (open) {
            loadFilters();
            if (recipe) {
                setFormData({
                    name: recipe.name || '',
                    emoji: recipe.emoji || '',
                    time: recipe.time || '',
                    difficulty: recipe.difficulty || '',
                    servings: recipe.servings?.toString() || '',
                    imageUrl: recipe.imageUrl || '',
                    recipeUrl: recipe.recipeUrl || '',
                    youtubeUrl: recipe.youtubeUrl || '',
                    ingredients: recipe.ingredients || '',
                    steps: recipe.steps || '',
                    notes: recipe.notes || '',
                    filterIds: recipe.filters.map(f => f.filter.id)
                });
            } else {
                setFormData({
                    name: '',
                    emoji: '',
                    time: '',
                    difficulty: '',
                    servings: '',
                    imageUrl: '',
                    recipeUrl: '',
                    youtubeUrl: '',
                    ingredients: '',
                    steps: '',
                    notes: '',
                    filterIds: []
                });
            }
        }
    }, [open, recipe]);

    const loadFilters = async () => {
        const data = await getFilters();
        setFilters(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                name: formData.name,
                emoji: formData.emoji || undefined,
                time: formData.time || undefined,
                difficulty: formData.difficulty || undefined,
                servings: formData.servings ? parseInt(formData.servings) : undefined,
                imageUrl: formData.imageUrl || undefined,
                recipeUrl: formData.recipeUrl || undefined,
                youtubeUrl: formData.youtubeUrl || undefined,
                ingredients: formData.ingredients || undefined,
                steps: formData.steps || undefined,
                notes: formData.notes || undefined,
                filterIds: formData.filterIds.length > 0 ? formData.filterIds : undefined
            };

            if (recipe) {
                await updateRecipe(recipe.id, data);
            } else {
                await createRecipe(data);
            }

            router.refresh();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar la receta');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleFilter = (filterId: string) => {
        setFormData(prev => ({
            ...prev,
            filterIds: prev.filterIds.includes(filterId)
                ? prev.filterIds.filter(id => id !== filterId)
                : [...prev.filterIds, filterId]
        }));
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {recipe ? 'Editar Receta' : 'Nueva Receta'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Ej: Tortilla de Patatas"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                            <input
                                type="text"
                                name="emoji"
                                value={formData.emoji}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="🍳"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo</label>
                            <input
                                type="text"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="30m"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Fácil">Fácil</option>
                                <option value="Media">Media</option>
                                <option value="Difícil">Difícil</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Porciones</label>
                            <input
                                type="number"
                                name="servings"
                                value={formData.servings}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="4"
                                min="1"
                            />
                        </div>
                    </div>

                    {/* URLs */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Enlaces</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Receta Externa</label>
                            <input
                                type="url"
                                name="recipeUrl"
                                value={formData.recipeUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Video YouTube</label>
                            <input
                                type="url"
                                name="youtubeUrl"
                                value={formData.youtubeUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="https://youtube.com/watch?v=..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Si hay video, se usará su thumbnail como imagen principal</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Contenido</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes</label>
                            <textarea
                                name="ingredients"
                                value={formData.ingredients}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="- 4 huevos&#10;- 2 patatas grandes&#10;- Aceite de oliva..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pasos</label>
                            <textarea
                                name="steps"
                                value={formData.steps}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="1. Pelar y cortar las patatas...&#10;2. Freír a fuego lento..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Consejos, variantes..."
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>

                        {filters.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {filters.map(filter => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => toggleFilter(filter.id)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.filterIds.includes(filter.id)
                                            ? 'ring-2 ring-offset-2 ring-current'
                                            : 'opacity-60 hover:opacity-100'
                                            }`}
                                        style={{
                                            backgroundColor: `${filter.color}20`,
                                            color: filter.color
                                        }}
                                    >
                                        {filter.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No hay filtros creados. Gestiona los filtros desde el botón principal.</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {recipe ? 'Guardar Cambios' : 'Crear Receta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
