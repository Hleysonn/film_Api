import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/services/api';

export const load: PageServerLoad = async ({ params, url }) => {
    const genreId = parseInt(params.id);
    const page = Number(url.searchParams.get('page')) || 1;

    if (isNaN(genreId)) {
        throw error(400, 'ID de genre invalide');
    }

    try {
        const [genreData, moviesData] = await Promise.all([
            api.getGenres(),
            api.getMoviesByGenre(genreId, page)
        ]);

        const genre = genreData.genres.find(g => g.id === genreId);
        if (!genre) {
            throw error(404, 'Genre non trouvé');
        }

        return {
            genre,
            films: moviesData.results,
            currentPage: moviesData.page,
            totalPages: moviesData.total_pages
        };
    } catch (e) {
        console.error('Erreur détaillée:', e);
        throw error(500, 'Erreur lors du chargement des films du genre');
    }
}; 