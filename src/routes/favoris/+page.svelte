<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/stores/auth';
    import { favoritesStore, type FavoriteMovie } from '$lib/stores/favorites';
    import MovieModal from '$lib/components/MovieModal.svelte';
    import '$styles/favoris.css';

    let isModalOpen = false;
    let selectedMovie: FavoriteMovie | null = null;

    function openModal(movie: FavoriteMovie) {
        selectedMovie = movie;
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        selectedMovie = null;
    }

    function removeFavorite(event: MouseEvent, movieId: number) {
        event.stopPropagation();
        favoritesStore.removeFavorite(movieId);
    }

    onMount(() => {
        const unsubscribe = auth.subscribe(({ isAuthenticated }) => {
            if (!isAuthenticated) {
                goto('/login');
            }
        });

        return () => unsubscribe();
    });
</script>

<div class="movies-container">
    <h1 class="title">MES FAVORIS</h1>

    {#if $favoritesStore.length === 0}
        <div class="empty-state" in:fade>
            <p>Vous n'avez pas encore de films favoris</p>
            <a href="/films" class="browse-link">Parcourir les films</a>
        </div>
    {:else}
        <div class="movies-grid" in:fade>
            {#each $favoritesStore as movie (movie.id)}
                <div class="movie-card" on:click={() => openModal(movie)}>
                    <div class="movie-poster">
                        <img 
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                            alt={movie.title}
                            loading="lazy"
                        />
                        <div class="movie-overlay">
                            <button 
                                class="remove-button"
                                on:click={(e) => removeFavorite(e, movie.id)}
                            >
                                ✕
                            </button>
                            <div class="movie-rating">
                                <span>{movie.vote_average.toFixed(1)}</span>
                            </div>
                            <p class="movie-overview">{movie.overview}</p>
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3>{movie.title}</h3>
                        <p class="release-date">
                            {new Date(movie.release_date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

{#if selectedMovie}
    <MovieModal 
        movie={selectedMovie} 
        isOpen={isModalOpen} 
        onClose={closeModal}
    />
{/if}
<!-- 
<style>
    .movies-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        min-height: calc(100vh - 100px);
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

    .empty-state {
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        padding: 4rem 2rem;
    }

    .browse-link {
        display: inline-block;
        margin-top: 1rem;
        color: #ff3e00;
        text-decoration: none;
        font-weight: 500;
        transition: opacity 0.2s ease;
    }

    .browse-link:hover {
        opacity: 0.8;
    }

    .movies-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
        padding: 1rem 0;
    }

    .movie-card {
        background: var(--card-bg, #1a1a1a);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    .movie-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
    }

    .movie-poster {
        position: relative;
        aspect-ratio: 2/3;
        overflow: hidden;
    }

    .movie-poster img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .movie-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        padding: 1.5rem;
        opacity: 0;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
    }

    .movie-card:hover .movie-overlay {
        opacity: 1;
    }

    .remove-button {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: rgba(255, 62, 0, 0.2);
        border: none;
        color: #ff3e00;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .remove-button:hover {
        background: rgba(255, 62, 0, 0.3);
        transform: scale(1.1);
    }

    .movie-rating {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: var(--accent-color, #ff3e00);
        color: white;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }

    .movie-overview {
        color: white;
        font-size: 0.9rem;
        line-height: 1.5;
        margin-top: auto;
        overflow-y: auto;
    }

    .movie-info {
        padding: 1rem;
    }

    .movie-info h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--text-color, white);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .release-date {
        margin: 0.5rem 0 0;
        font-size: 0.9rem;
        color: var(--text-muted, #888);
    }

    @media (max-width: 1200px) {
        .movies-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (max-width: 900px) {
        .movies-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 600px) {
        .movies-grid {
            grid-template-columns: repeat(1, 1fr);
            gap: 1rem;
        }
    }

    @media (max-width: 768px) {
        .movies-container {
            padding: 1rem;
        }

        .title {
            font-size: 2rem;
        }
    }
</style>  -->