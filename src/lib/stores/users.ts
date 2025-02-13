import { writable, get } from 'svelte/store';

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
}

function createUsersStore() {
 
    const storedUsers = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('users') || '[]')
        : [];

    const { subscribe, set, update } = writable<User[]>(storedUsers);
    const store = { subscribe };

    return {
        subscribe,
        register: (user: Omit<User, 'id'>) => {
            const users = get(store);
            // Vérif email
            if (users.some(u => u.email === user.email)) {
                throw new Error('Cet email est déjà utilisé');
            }

            const newUser = {
                ...user,
                id: crypto.randomUUID()
            };

            const updatedUsers = [...users, newUser];
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            set(updatedUsers);
            return newUser;
        },
        authenticate: (email: string, password: string) => {
            const users = get(store);
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                throw new Error('Email ou mot de passe incorrect');
            }
            return user;
        }
    };
}

export const usersStore = createUsersStore(); 