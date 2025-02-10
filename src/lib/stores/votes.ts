import { writable, get } from 'svelte/store';
import { auth } from './auth';

interface UserVotes {
    [userId: string]: {
        [movieId: number]: number;
    };
}

function createVotesStore() {
    // Charger les votes depuis localStorage
    const storedVotes = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userVotes') || '{}')
        : {};

    const { subscribe, set, update } = writable<{[movieId: number]: number}>({});

    // Initialiser les votes de l'utilisateur courant
    auth.subscribe(($auth) => {
        if ($auth.isAuthenticated && $auth.user) {
            const userVotes = storedVotes[$auth.user.id] || {};
            set(userVotes);
        } else {
            set({});
        }
    });

    return {
        subscribe,
        addVote: (movieId: number, rating: number) => {
            update(votes => {
                const authStore = get(auth);
                if (!authStore.isAuthenticated || !authStore.user) return votes;
                
                const userId = authStore.user.id;
                const newVotes = { ...votes, [movieId]: rating };
                
                // Mettre à jour le stockage local
                const allVotes = {
                    ...storedVotes,
                    [userId]: newVotes
                };
                localStorage.setItem('userVotes', JSON.stringify(allVotes));
                
                return newVotes;
            });
        },
        getVote: (movieId: number) => {
            const votes = get({ subscribe });
            return votes[movieId] || 0;
        },
        hasVoted: (movieId: number) => {
            const votes = get({ subscribe });
            return movieId in votes;
        }
    };
}

export const votesStore = createVotesStore(); 