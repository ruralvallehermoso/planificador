import { getRecipes, getFilters } from './actions';
import ComidasClient from './ComidasClient';

export default async function ComidasPage() {
    const [recipes, filters] = await Promise.all([
        getRecipes(),
        getFilters()
    ]);

    return <ComidasClient recipes={recipes} filters={filters} />;
}
