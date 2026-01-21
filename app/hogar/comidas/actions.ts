'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// =====================
// RECIPE ACTIONS
// =====================

export async function getRecipes() {
    const recipes = await prisma.recipe.findMany({
        include: {
            filters: {
                include: {
                    filter: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return recipes;
}

export async function getRecipe(id: string) {
    const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: {
            filters: {
                include: {
                    filter: true
                }
            }
        }
    });
    return recipe;
}

export async function createRecipe(data: {
    name: string;
    emoji?: string;
    time?: string;
    difficulty?: string;
    servings?: number;
    imageUrl?: string;
    recipeUrl?: string;
    youtubeUrl?: string;
    ingredients?: string;
    steps?: string;
    notes?: string;
    filterIds?: string[];
}) {
    const { filterIds, ...recipeData } = data;

    const recipe = await prisma.recipe.create({
        data: {
            ...recipeData,
            filters: filterIds ? {
                create: filterIds.map(filterId => ({ filterId }))
            } : undefined
        }
    });

    revalidatePath('/hogar/comidas');
    return recipe;
}

export async function updateRecipe(id: string, data: {
    name?: string;
    emoji?: string;
    time?: string;
    difficulty?: string;
    servings?: number;
    imageUrl?: string;
    recipeUrl?: string;
    youtubeUrl?: string;
    ingredients?: string;
    steps?: string;
    notes?: string;
    filterIds?: string[];
}) {
    const { filterIds, ...recipeData } = data;

    // Delete existing filter assignments
    await prisma.recipeFilterAssignment.deleteMany({
        where: { recipeId: id }
    });

    const recipe = await prisma.recipe.update({
        where: { id },
        data: {
            ...recipeData,
            filters: filterIds ? {
                create: filterIds.map(filterId => ({ filterId }))
            } : undefined
        }
    });

    revalidatePath('/hogar/comidas');
    return recipe;
}

export async function deleteRecipe(id: string) {
    await prisma.recipe.delete({
        where: { id }
    });

    revalidatePath('/hogar/comidas');
    return { success: true };
}

// =====================
// FILTER ACTIONS
// =====================

export async function getFilters() {
    const filters = await prisma.recipeFilter.findMany({
        orderBy: { name: 'asc' }
    });
    return filters;
}

export async function createFilter(data: { name: string; color?: string }) {
    const filter = await prisma.recipeFilter.create({
        data
    });

    revalidatePath('/hogar/comidas');
    return filter;
}

export async function updateFilter(id: string, data: { name?: string; color?: string }) {
    const filter = await prisma.recipeFilter.update({
        where: { id },
        data
    });

    revalidatePath('/hogar/comidas');
    return filter;
}

export async function deleteFilter(id: string) {
    await prisma.recipeFilter.delete({
        where: { id }
    });

    revalidatePath('/hogar/comidas');
    return { success: true };
}
