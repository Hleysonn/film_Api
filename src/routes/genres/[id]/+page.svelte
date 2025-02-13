<script lang="ts">
    import { fade } from 'svelte/transition';
    import MovieModal from '$lib/components/MovieModal.svelte';
    import { favoritesStore } from '$lib/stores/favorites';
    import { searchQuery } from '$lib/stores/search';
    import { goto } from '$app/navigation';
    import '$styles/films.css';

    interface Film {
        id: number;
        title: string;
        poster_path: string;
        vote_average: number;
        release_date: string;
        overview: string;
        original_title: string;
        vote_count: number;
    }

    export let data;
    let films = data.films;
    let currentPage = data.currentPage;
    let totalPages = data.totalPages;
    let genre = data.genre;
    let selectedMovie: Film | null = null;
    let isModalOpen = false;

    $: filteredFilms = films.filter(film => 
        film.title.toLowerCase().includes($searchQuery.toLowerCase()) ||
        film.overview.toLowerCase().includes($searchQuery.toLowerCase())
    );

    async function nextPage() {
        if (currentPage < totalPages) {
            await goto(`?page=${currentPage + 1}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    async function previousPage() {
        if (currentPage > 1) {
            await goto(`?page=${currentPage - 1}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function openModal(movie: Film) {
        selectedMovie = movie;
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        selectedMovie = null;
    }

    function toggleFavorite(event: MouseEvent, movie: Film) {
        event.stopPropagation();
        if (favoritesStore.isFavorite(movie.id)) {
            favoritesStore.removeFavorite(movie.id);
        } else {
            favoritesStore.addFavorite(movie);
        }
    }
</script>

<div class="movies-container">
    <h1 class="title">FILMS - {genre.name.toUpperCase()}</h1>
    
    {#if $searchQuery}
        <div class="search-results" transition:fade>
            {#if filteredFilms.length === 0}
                <p class="no-results">Aucun film ne correspond à votre recherche "{$searchQuery}"</p>
            {:else}
                <p class="results-count">{filteredFilms.length} film{filteredFilms.length > 1 ? 's' : ''} trouvé{filteredFilms.length > 1 ? 's' : ''}</p>
            {/if}
        </div>
    {/if}

    <div class="movies-grid">
        {#each filteredFilms as movie (movie.id)}
            <div class="movie-card" transition:fade on:click={() => openModal(movie)}>
                <div class="movie-poster">
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                        alt={movie.title}
                        loading="lazy"
                    />
                    <div class="movie-overlay">
                        <div class="movie-rating">
                            <span>{movie.vote_average.toFixed(1)}</span>
                        </div>
                        <button 
                            class="favorite-button" 
                            on:click={(e) => toggleFavorite(e, movie)}
                            class:is-favorite={favoritesStore.isFavorite(movie.id)}
                        >
                            ♥
                        </button>
                        <p class="movie-overview">{movie.overview}</p>
                    </div>
                </div>
                <div class="movie-info">
                    <h3>{movie.title}</h3>
                    <p class="release-date">{new Date(movie.release_date).getFullYear()}</p>
                </div>
            </div>
        {/each}
    </div>

    <div class="pagination">
        <button 
            class="pagination-button" 
            on:click={previousPage} 
            disabled={currentPage === 1}
        >
            ←
        </button>
        <span class="page-info">Page {currentPage} / {totalPages}</span>
        <button 
            class="pagination-button" 
            on:click={nextPage} 
            disabled={currentPage === totalPages}
        >
            →
        </button>
    </div>
</div>

{#if selectedMovie}
    <MovieModal 
        movie={selectedMovie} 
        isOpen={isModalOpen} 
        onClose={closeModal}
    />
{/if} 