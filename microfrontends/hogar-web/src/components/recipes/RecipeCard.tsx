'use client';

import { Clock, ExternalLink, Youtube } from 'lucide-react';

interface RecipeCardProps {
    recipe: {
        id: string;
        name: string;
        emoji?: string | null;
        time?: string | null;
        difficulty?: string | null;
        servings?: number | null;
        imageUrl?: string | null;
        recipeUrl?: string | null;
        youtubeUrl?: string | null;
        filters: { filter: { id: string; name: string; color: string } }[];
    };
    onClick: () => void;
}

function getYoutubeThumbnail(url: string): string | null {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
    // Determine image: YouTube thumbnail > user image > placeholder gradient
    const youtubeThumb = recipe.youtubeUrl ? getYoutubeThumbnail(recipe.youtubeUrl) : null;
    const displayImage = youtubeThumb || recipe.imageUrl;

    const gradients = [
        'from-amber-100 to-orange-100',
        'from-red-100 to-orange-100',
        'from-green-100 to-emerald-100',
        'from-yellow-100 to-amber-100',
        'from-pink-100 to-rose-100',
        'from-blue-100 to-indigo-100',
    ];
    const bgGradient = gradients[recipe.name.length % gradients.length];

    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden relative"
        >
            {/* Background Gradient Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

            <div className="relative">
                <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative">
                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt={recipe.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${bgGradient} flex items-center justify-center`}>
                            <span className="text-6xl">{recipe.emoji || '🍽️'}</span>
                        </div>
                    )}

                    {/* YouTube indicator */}
                    {recipe.youtubeUrl && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white p-1.5 rounded-lg shadow-sm">
                            <Youtube className="w-4 h-4" />
                        </div>
                    )}

                    {/* External link indicator */}
                    {recipe.recipeUrl && !recipe.youtubeUrl && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                            <ExternalLink className="w-4 h-4" />
                        </div>
                    )}
                </div>

                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
                        {recipe.name}
                    </h3>
                    {recipe.emoji && (
                        <span className="text-2xl filter drop-shadow-sm">{recipe.emoji}</span>
                    )}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    {recipe.time && (
                        <>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {recipe.time}
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        </>
                    )}
                    {recipe.difficulty && (
                        <div className={`font-medium ${recipe.difficulty === 'Fácil' ? 'text-green-600' :
                                recipe.difficulty === 'Media' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {recipe.difficulty}
                        </div>
                    )}
                </div>

                {/* Filters */}
                {recipe.filters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {recipe.filters.map(({ filter }) => (
                            <span
                                key={filter.id}
                                className="px-2 py-1 text-xs rounded-md font-medium"
                                style={{
                                    backgroundColor: `${filter.color}20`,
                                    color: filter.color
                                }}
                            >
                                {filter.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
