import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/services/api';

export const load: PageServerLoad = async ({ url }) => {
    const page = Number(url.searchParams.get('page')) || 1;
    
 
    // if (!import.meta.env.VITE_TMDB_API_URL || !import.meta.env.VITE_TMDB_API_KEY) {
    //     console.error('Variables d\'environnement manquantes:', {
    //         apiUrl: !!import.meta.env.VITE_TMDB_API_URL,
    //         apiKey: !!import.meta.env.VITE_TMDB_API_KEY
    //     });
    //     throw error(500, 'Configuration incorrecte - Variables d\'environnement manquantes');
    // }

    try {
        const data = await api.getTrendingMovies(page);
        return {
            films: data.results,
            currentPage: data.page,
            totalPages: data.total_pages
        };
    } catch (e) {
        console.error('Erreur détaillée:', e);
        throw error(500, 'Erreur lors du chargement des films tendances');
    }
}; 