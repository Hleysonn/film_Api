import { writable, get } from 'svelte/store';
import { auth } from './auth';

// Type pour un film favori
export interface FavoriteMovie {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    overview: string;
    original_title: string;
    vote_count: number;
}

interface UserFavorites {
    [userId: string]: FavoriteMovie[];
}

function createFavoritesStore() {
    // Charger les favoris depuis localStorage
    const storedFavorites = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userFavorites') || '{}')
        : {};

    const { subscribe, set, update } = writable<FavoriteMovie[]>([]);

    // Initialiser les favoris de l'utilisateur courant
    auth.subscribe(($auth) => {
        if ($auth.isAuthenticated && $auth.user) {
            const allFavorites = storedFavorites[$auth.user.id] || [];
            set(allFavorites);
        } else {
            set([]);
        }
    });

    return {
        subscribe,
        addFavorite: (movie: FavoriteMovie) => {
            update(favorites => {
                const authStore = get(auth);
                if (!authStore.isAuthenticated || !authStore.user) return favorites;
                
                const userId = authStore.user.id;
                if (favorites.some(f => f.id === movie.id)) return favorites;

                const newFavorites = [...favorites, movie];
                const allFavorites = {
                    ...storedFavorites,
                    [userId]: newFavorites
                };
                
                localStorage.setItem('userFavorites', JSON.stringify(allFavorites));
                return newFavorites;
            });
        },
        removeFavorite: (movieId: number) => {
            update(favorites => {
                const authStore = get(auth);
                if (!authStore.isAuthenticated || !authStore.user) return favorites;

                const userId = authStore.user.id;
                const newFavorites = favorites.filter(f => f.id !== movieId);
                const allFavorites = {
                    ...storedFavorites,
                    [userId]: newFavorites
                };

                localStorage.setItem('userFavorites', JSON.stringify(allFavorites));
                return newFavorites;
            });
        },
        isFavorite: (movieId: number) => {
            const favorites = get({ subscribe });
            return favorites.some(f => f.id === movieId);
        }
    };
}

export const favoritesStore = createFavoritesStore(); 