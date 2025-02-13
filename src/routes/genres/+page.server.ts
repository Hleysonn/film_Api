import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/services/api';

export const load: PageServerLoad = async () => {
    try {
        const data = await api.getGenres();
        return {
            genres: data.genres
        };
    } catch (e) {
        console.error('Erreur détaillée:', e);
        throw error(500, 'Erreur lors du chargement des genres');
    }
}; 