import { writable } from 'svelte/store';

// Vérifie si le thème est déjà stocké, sinon utilise la préférence système
const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
const defaultTheme = storedTheme || (prefersDark ? 'dark' : 'light');

export const theme = writable<'dark' | 'light'>(defaultTheme);

// Met à jour le localStorage et les classes CSS quand le thème change
theme.subscribe((value) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(value);
    }
}); 