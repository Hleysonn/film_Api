import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/services/api';

export const load: PageServerLoad = async ({ url }) => {
    const page = Number(url.searchParams.get('page')) || 1;

    try {
        const data = await api.getPopularMovies(page);
        return {
            films: data.results,
            currentPage: data.page,
            totalPages: data.total_pages
        };
    } catch (e) {
        console.error('Erreur détaillée:', e);
        throw error(500, 'Erreur lors du chargement des films populaires');
    }
}; 