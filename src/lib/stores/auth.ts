import { writable } from 'svelte/store';

interface User {
    id: string;
    username: string;
    email: string;
}

function createAuthStore() {
    const { subscribe, set, update } = writable<{
        isAuthenticated: boolean;
        user: User | null;
    }>({
        isAuthenticated: false,
        user: null
    });

    return {
        subscribe,
        login: (user: User) => {
            set({ isAuthenticated: true, user });
        },
        logout: () => {
            set({ isAuthenticated: false, user: null });
        }
    };
}

export const auth = createAuthStore(); 