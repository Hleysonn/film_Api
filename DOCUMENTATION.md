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

## 7. Navigation et Icônes

### Structure de la Sidebar (`src/routes/+layout.svelte`)
```svelte
<script>
    // Configuration des items du menu
    const menuItems = [
        { 
            icon: '/icons/film.svg',
            href: '/films',
            label: 'Films',
            activeColor: '#ff3e00'  // Orange pour les films
        },
        { 
            icon: '/icons/trending.svg',
            href: '/tendances',
            label: 'Tendances',
            activeColor: '#ff0066'  // Rose pour les tendances
        },
        { 
            icon: '/icons/star.svg',
            href: '/favoris',
            label: 'Favoris',
            activeColor: '#ffd700',  // Or pour les favoris
            requireAuth: true
        },
        { 
            icon: '/icons/category.svg',
            href: '/genres',
            label: 'Genres',
            activeColor: '#00ff88'  // Vert menthe pour les genres
        },
        { 
            icon: '/icons/calendar.svg',
            href: '/prochainement',
            label: 'À venir',
            activeColor: '#00ccff'  // Bleu ciel pour les sorties
        }
    ];
</script>

<!-- Template de navigation -->
<nav class="nav-menu">
    {#each menuItems as item}
        {@const isActive = $page.url.pathname === item.href}
        <a 
            href={item.href}
            class="nav-link"
            class:active={isActive}
            style="--active-color: {item.activeColor}"
        >
            <img 
                src={item.icon} 
                alt={item.label}
                class="nav-icon"
                class:active={isActive}
            />
            <span class="nav-label" class:active={isActive}>
                {item.label}
            </span>
        </a>
    {/each}
</nav>
```

### Styles de Navigation
```css
/* Styles de la sidebar */
.sidebar {
    width: 260px;
    background: #0A0A0F;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
}

/* Styles des liens de navigation */
.nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    transition: all 0.2s ease;
}

/* Effet hover */
.nav-link:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
}

/* État actif */
.nav-link.active {
    background: color-mix(in srgb, var(--active-color) 10%, transparent);
    color: var(--active-color);
}

/* Barre latérale colorée */
.nav-link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 1.5rem;
    background: var(--active-color);
    border-radius: 0 2px 2px 0;
}

/* Icônes de navigation */
.nav-icon {
    width: 20px;
    height: 20px;
    opacity: 0.7;
    transition: all 0.2s ease;
    filter: grayscale(100%);
}

.nav-icon.active {
    opacity: 1;
    filter: none;
    /* Application de la couleur active */
    filter: drop-shadow(0 0 8px var(--active-color));
}

/* Label du menu */
.nav-label {
    font-size: 0.9375rem;
    font-weight: 500;
    transition: color 0.2s ease;
}

.nav-label.active {
    color: var(--active-color);
}

/* Adaptation mobile */
@media (max-width: 768px) {
    .sidebar {
        width: 80px;
        padding: 1rem 0.5rem;
    }

    .nav-label {
        display: none;
    }

    .nav-link {
        justify-content: center;
        padding: 0.75rem;
    }
}
```

### Personnalisation des Icônes SVG
```css
/* Modification des couleurs SVG */
.nav-icon {
    /* Permet la modification des couleurs SVG */
    mask-size: cover;
    -webkit-mask-size: cover;
    background-color: currentColor;
}

/* Exemple pour chaque icône active */
.nav-link.active[href="/films"] .nav-icon {
    background-color: #ff3e00;
}

.nav-link.active[href="/tendances"] .nav-icon {
    background-color: #ff0066;
}

.nav-link.active[href="/favoris"] .nav-icon {
    background-color: #ffd700;
}

.nav-link.active[href="/genres"] .nav-icon {
    background-color: #00ff88;
}

.nav-link.active[href="/prochainement"] .nav-icon {
    background-color: #00ccff;
}
```

---
Documentation technique rédigée par Franzy pour le cours de SVELTE 

# Documentation du Projet Film API

## Table des Matières
1. [Service API Centralisé](#service-api-centralisé)
2. [Gestion des Genres](#gestion-des-genres)
3. [Pages de Navigation](#pages-de-navigation)
4. [Gestion d'Erreurs](#gestion-derreurs)
5. [Recherche et Filtrage](#recherche-et-filtrage)
6. [Optimisations](#optimisations)
7. [Internationalisation](#internationalisation)

## Service API Centralisé

Le service API est centralisé dans `src/lib/services/api.ts` et fournit les méthodes suivantes :

```typescript
class ApiService {
    // Méthode privée pour les appels API authentifiés
    private async fetchWithAuth(endpoint: string, params: Record<string, string | number>)

    // Films populaires
    async getPopularMovies(page: number = 1): Promise<MovieResponse>

    // Films tendances de la semaine
    async getTrendingMovies(page: number = 1): Promise<MovieResponse>

    // Films à venir
    async getUpcomingMovies(page: number = 1): Promise<MovieResponse>

    // Liste des genres
    async getGenres(): Promise<GenreResponse>

    // Films par genre
    async getMoviesByGenre(genreId: number, page: number = 1): Promise<MovieResponse>

    // Recherche de films par titre
    async getMoviesByTitle(title: string, page: number = 1): Promise<MovieResponse>

    // Films par date de sortie
    async getMoviesByDate(date: string, page: number = 1): Promise<MovieResponse>

    // Films par note
    async getMoviesByNote(note: number, page: number = 1): Promise<MovieResponse>
}
```

## Gestion des Genres

### Fichiers Serveur
- `/genres/+page.server.ts` : Liste tous les genres disponibles
- `/genres/[id]/+page.server.ts` : Charge les films d'un genre spécifique

### Interfaces
```typescript
interface Genre {
    id: number;
    name: string;
}

interface GenreResponse {
    genres: Genre[];
}
```

## Pages de Navigation

### Page de Genre (`/genres/[id]/+page.svelte`)
- Affichage des films par genre
- Pagination
- Recherche dans les résultats
- Gestion des favoris
- Modal de détails des films

## Gestion d'Erreurs

- Vérification des variables d'environnement
- Messages d'erreur détaillés
- Gestion des erreurs API
- Validation des données reçues

## Recherche et Filtrage

### Fonctionnalités
- Recherche par titre
- Filtrage par date
- Filtrage par note
- Tri par popularité pour les genres

### Exemple d'utilisation
```typescript
// Recherche de films
const films = await api.getMoviesByTitle("Matrix");

// Filtrage par date
const filmsDate = await api.getMoviesByDate("2023-01-01");

// Filtrage par note
const filmsNote = await api.getMoviesByNote(8);
```

## Optimisations

- Utilisation de `Promise.all` pour les requêtes parallèles
- Chargement lazy des images
- Pagination côté serveur
- Transitions fluides avec Svelte

### Exemple de requêtes parallèles
```typescript
const [genreData, moviesData] = await Promise.all([
    api.getGenres(),
    api.getMoviesByGenre(genreId, page)
]);
```

## Internationalisation

Support complet du français pour :
- Les titres de films
- Les descriptions
- Les dates
- Les messages d'erreur
- Les genres

### Configuration
```typescript
// Configuration de la langue dans les requêtes API
language: 'fr-FR'

// Formatage des dates
new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
})
```

## Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec :
```env
VITE_TMDB_API_URL=https://api.themoviedb.org/3
VITE_TMDB_API_KEY=votre_clé_api_tmdb
```

## Contribution

Pour contribuer au projet :
1. Forkez le repository
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Créez une Pull Request 