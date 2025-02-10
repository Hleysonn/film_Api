<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    
    interface Genre {
        id: number;
        name: string;
    }
    
    interface MoviesByGenre {
        id: number;
        title: string;
        poster_path: string;
        vote_average: number;
        release_date: string;
    }

    let genres: Genre[] = [];
    let selectedGenre: Genre | null = null;
    let moviesByGenre: MoviesByGenre[] = [];
    let loading = true;
    let error: string | null = null;

    async function loadGenres() {
        try {
            loading = true;
            const response = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR`
            );
            const data = await response.json();
            genres = data.genres;
        } catch (e) {
            error = "Erreur lors du chargement des genres";
        } finally {
            loading = false;
        }
    }

    async function loadMoviesByGenre(genreId: number) {
        try {
            loading = true;
            const response = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR&with_genres=${genreId}&sort_by=popularity.desc`
            );
            const data = await response.json();
            moviesByGenre = data.results.slice(0, 4); // On prend les 4 films les plus populaires
            selectedGenre = genres.find(g => g.id === genreId) || null;
        } catch (e) {
            error = "Erreur lors du chargement des films";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadGenres();
    });
</script>

<div class="movies-container">
    <h1 class="title">GENRES</h1>
    
    {#if loading && genres.length === 0}
        <div class="loading-container">
            <div class="loader"></div>
            <p>Chargement des genres...</p>
        </div>
    {:else if error}
        <div class="error-container">
            <p>{error}</p>
        </div>
    {:else}
        <div class="genres-grid">
            {#each genres as genre (genre.id)}
                <div 
                    class="genre-card" 
                    transition:fade 
                    on:click={() => loadMoviesByGenre(genre.id)}
                    on:keydown={(e) => e.key === 'Enter' && loadMoviesByGenre(genre.id)}
                    tabindex="0"
                    role="button"
                    aria-label={`Voir les films du genre ${genre.name}`}
                >
                    <h3>{genre.name}</h3>
                    {#if selectedGenre?.id === genre.id && moviesByGenre.length > 0}
                        <div class="movies-preview">
                            {#each moviesByGenre as movie}
                                <div class="preview-poster">
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                                        alt={movie.title}
                                        loading="lazy"
                                    />
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .movies-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        min-height: calc(100vh - 100px);
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        gap: 1rem;
        color: var(--text-color, white);
    }

    .loader {
        width: 50px;
        height: 50px;
        border: 4px solid var(--text-muted, #888);
        border-top-color: var(--accent-color, #ff3e00);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .error-container {
        text-align: center;
        color: #ff3e00;
        padding: 2rem;
    }

    .genres-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        padding: 1rem 0;
    }

    .genre-card {
        background: var(--card-bg, #1a1a1a);
        border-radius: 12px;
        padding: 2rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .genre-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
        background: var(--accent-color, #ff3e00);
    }

    .genre-card h3 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-color, white);
        font-weight: 600;
    }

    .movies-preview {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .preview-poster {
        aspect-ratio: 2/3;
        overflow: hidden;
        border-radius: 6px;
    }

    .preview-poster img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .title {
        text-align: center;
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 2rem;
        color: var(--text-color, white);
        text-transform: uppercase;
        letter-spacing: 0.2em;
        position: relative;
        padding-bottom: 1rem;
    }

    .title::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 4px;
        background-color: var(--accent-color, #ff3e00);
        border-radius: 2px;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 1200px) {
        .genres-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .genres-grid {
            grid-template-columns: 1fr;
        }

        .movies-container {
            padding: 1rem;
        }

        .title {
            font-size: 2rem;
        }
    }
</style> 