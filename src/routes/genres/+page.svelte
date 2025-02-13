<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import '$styles/genres.css';
    
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

    const loadGenres = async () => {
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
    };

    const loadMoviesByGenre = async (genreId: number) => {
        try {
            loading = true;
            const response = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR&with_genres=${genreId}&sort_by=popularity.desc`
            );
            const data = await response.json();
            moviesByGenre = data.results.slice(0, 4);
            selectedGenre = genres.find(g => g.id === genreId) || null;
        } catch (e) {
            error = "Erreur lors du chargement des films";
        } finally {
            loading = false;
        }
    };

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