# Documentation CinéApp

## 1. Interfaces et Types

```typescript
// Interface pour un film
interface Film {
    id: number;                // Identifiant unique du film
    title: string;            // Titre en français
    original_title: string;   // Titre original
    poster_path: string;      // Chemin de l'affiche
    vote_average: number;     // Note moyenne (0-10)
    release_date: string;     // Date de sortie
    overview: string;         // Synopsis
    vote_count: number;       // Nombre de votes
}

// Interface utilisateur
interface User {
    id: string;              // ID unique
    username: string;        // Nom d'utilisateur
    email: string;           // Email
    password: string;        // Mot de passe (hashé en production)
}

// Interface pour les favoris
interface FavoriteMovie extends Film {
    // Hérite de toutes les propriétés de Film
}
```

## 2. Components Principaux

### Splash Screen (`src/routes/+page.svelte`)
```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly, scale } from 'svelte/transition';
    import { quintOut, elasticOut } from 'svelte/easing';

    // États pour les animations
    let showContent = false;
    let showLogo = false;
    let showTagline = false;
    let showButtons = false;

    onMount(() => {
        // Séquence d'animations
        showContent = true;
        setTimeout(() => showLogo = true, 800);
        setTimeout(() => showTagline = true, 1600);
        setTimeout(() => showButtons = true, 2200);
    });
</script>

<!-- Animation des particules -->
<div class="splash-container" in:fade={{ duration: 1500, easing: quintOut }}>
    <!-- Particules lumineuses -->
    {#each Array(15) as _, i}
        <div class="light-particle small" 
             style="--delay: {Math.random() * -30}s;
                    --size: {4 + Math.random() * 6}px;
                    --opacity: {0.4 + Math.random() * 0.3};">
        </div>
    {/each}
</div>
```

### Modal Film (`src/lib/components/MovieModal.svelte`)
```svelte
<script lang="ts">
    // Props du composant
    export let movie: Film;
    export let isOpen: boolean;
    export let onClose: () => void;

    // États locaux
    let videoKey: string | null = null;
    let selectedRating = $votesStore[movie.id] || 0;
    let isVoting = false;

    // Chargement de la bande-annonce
    async function fetchTrailer() {
        const response = await fetch(
            `${import.meta.env.VITE_TMDB_API_URL}/movie/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const data = await response.json();
        videoKey = data.results[0]?.key || null;
    }

    // Système de vote
    async function submitVote() {
        if (!$auth.isAuthenticated) return;
        
        try {
            isVoting = true;
            await votesStore.addVote(movie.id, selectedRating);
        } finally {
            isVoting = false;
        }
    }
</script>
```

## 3. Stores Détaillés

### Store Authentification
```typescript
// src/lib/stores/auth.ts
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
            // Sauvegarde en localStorage
            localStorage.setItem('auth', JSON.stringify({ user }));
        },
        logout: () => {
            set({ isAuthenticated: false, user: null });
            localStorage.removeItem('auth');
        }
    };
}
```

### Store Favoris
```typescript
// src/lib/stores/favorites.ts
function createFavoritesStore() {
    // Structure pour stocker les favoris par utilisateur
    interface UserFavorites {
        [userId: string]: FavoriteMovie[];
    }

    const { subscribe, set, update } = writable<FavoriteMovie[]>([]);

    return {
        subscribe,
        addFavorite: (movie: FavoriteMovie) => {
            update(favorites => {
                // Vérification si déjà en favoris
                if (favorites.some(f => f.id === movie.id)) return favorites;
                
                const newFavorites = [...favorites, movie];
                // Sauvegarde locale
                localStorage.setItem('favorites', JSON.stringify(newFavorites));
                return newFavorites;
            });
        },
        removeFavorite: (movieId: number) => {
            update(favorites => {
                const newFavorites = favorites.filter(f => f.id !== movieId);
                localStorage.setItem('favorites', JSON.stringify(newFavorites));
                return newFavorites;
            });
        }
    };
}
```

## 4. Fonctions Utilitaires

```typescript
// Formatage de date
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Gestion des erreurs API
async function handleApiRequest<T>(
    url: string, 
    options?: RequestInit
): Promise<T> {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Erreur réseau:', error);
        throw error;
    }
}
```

## 5. Styles CSS Détaillés

```css
/* Variables globales */
:root {
    /* Couleurs */
    --accent-color: #ff3e00;
    --text-color: white;
    --card-bg: #1a1a1a;
    --error-color: #ff3e3e;
    
    /* Espacements */
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 2rem;
    
    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}

/* Animations */
@keyframes float-particle {
    0% { 
        transform: translate(0, 0);
        opacity: 0;
    }
    20% { 
        opacity: var(--opacity);
    }
    80% { 
        opacity: var(--opacity);
    }
    100% { 
        transform: translate(var(--travel-distance), calc(var(--travel-distance) * -1));
        opacity: 0;
    }
}

/* Styles des cartes */
.movie-card {
    background: var(--card-bg);
    border-radius: 12px;
    overflow: hidden;
    transition: transform var(--transition-normal);
    
    &:hover {
        transform: translateY(-5px);
        
        .movie-overlay {
            opacity: 1;
        }
    }
}

/* Media Queries */
@media (max-width: 768px) {
    .movies-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
    }
    
    .modal-content {
        width: 95%;
        padding: var(--spacing-md);
    }
}
```

## 6. Gestion des Routes

```typescript
// Protection des routes
function checkAuth() {
    if (!$auth.isAuthenticated) {
        goto('/login');
        return false;
    }
    return true;
}

// Routes protégées
const protectedRoutes = [
    '/favoris',
    '/profile'
];

// Middleware de route
$: if (protectedRoutes.includes($page.url.pathname)) {
    checkAuth();
}
```

---
Documentation technique rédigée par Franzy pour le cours de SVELTE 