<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import MovieModal from '$lib/components/MovieModal.svelte';
    import { favoritesStore } from '$lib/stores/favorites';
    import { searchQuery } from '$lib/stores/search';
    import '$styles/tendances.css';
    
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
    
    let films: Film[] = [];
    let loading = true;
    let error: string | null = null;
    let currentPage = 1;
    let totalPages = 1;
    let selectedMovie: Film | null = null;
    let isModalOpen = false;

    $: filteredFilms = films.filter(film => 
        film.title.toLowerCase().includes($searchQuery.toLowerCase()) ||
        film.overview.toLowerCase().includes($searchQuery.toLowerCase())
    );

    async function loadMovies(page: number) {
        try {
            loading = true;
            const response = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR&page=${page}`
            );
            const data = await response.json();
            films = data.results;
            totalPages = data.total_pages;
            currentPage = data.page;
        } catch (e) {
            error = "Erreur lors du chargement des films";
        } finally {
            loading = false;
        }
    }

    function nextPage() {
        if (currentPage < totalPages) {
            loadMovies(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function previousPage() {
        if (currentPage > 1) {
            loadMovies(currentPage - 1);
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
        event.stopPropagation(); // Empêche l'ouverture du modal
        if (favoritesStore.isFavorite(movie.id)) {
            favoritesStore.removeFavorite(movie.id);
        } else {
            favoritesStore.addFavorite(movie);
        }
    }

    onMount(() => {
        loadMovies(1);
    });
</script>

<div class="movies-container">
    <h1 class="title">FILMS TENDANCES</h1>
    
    {#if loading && films.length === 0}
        <div class="loading-container">
            <div class="loader"></div>
            <p>Chargement des films...</p>
        </div>
    {:else if error}
        <div class="error-container">
            <p>{error}</p>
        </div>
    {:else}
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
                disabled={currentPage === 1 || loading}
            >
                ←
            </button>
            <span class="page-info">Page {currentPage} / {totalPages}</span>
            <button 
                class="pagination-button" 
                on:click={nextPage} 
                disabled={currentPage === totalPages || loading}
            >
                →
            </button>
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

<!-- <style>
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
        color: var(--text-primary);
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

    .movies-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 2rem;
        padding: 1rem 0;
    }

    .movie-card {
        background: var(--card-bg);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: var(--card-shadow);
        cursor: pointer;
        border: 1px solid var(--card-border);
    }

    .movie-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--card-hover-shadow);
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
        background: var(--overlay-bg);
        padding: 1.5rem;
        opacity: 0;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .movie-card:hover .movie-overlay {
        opacity: 1;
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
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .movie-overview {
        color: var(--overlay-text);
        font-size: 0.9rem;
        line-height: 1.5;
        max-height: 80%;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--accent-color) rgba(255, 255, 255, 0.1);
    }

    .movie-info {
        padding: 1rem;
    }

    .movie-info h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .release-date {
        margin: 0.5rem 0 0;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .title {
        text-align: center;
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 2rem;
        color: var(--text-primary);
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

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;
        margin-top: 3rem;
        padding: 1rem;
    }

    .pagination-button {
        background: var(--accent-color, #ff3e00);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.8rem 1.5rem;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .pagination-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination-button:not(:disabled):hover {
        opacity: 0.9;
        transform: translateY(-2px);
    }

    .page-info {
        font-size: 1.1rem;
        color: var(--text-primary);
        min-width: 150px;
        text-align: center;
        font-weight: 500;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 1400px) {
        .movies-container {
            padding: 2rem;
        }

        .movies-grid {
            gap: 1.5rem;
        }
    }

    @media (max-width: 1200px) {
        .movies-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    @media (max-width: 1024px) {
        .movies-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (max-width: 768px) {
        .movies-container {
            padding: 1.5rem;
        }

        .movies-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
        }

        .title {
            font-size: 2rem;
            margin-bottom: 1.5rem;
        }

        .movie-info h3 {
            font-size: 1rem;
        }

        .movie-overview {
            font-size: 0.8125rem;
            line-height: 1.4;
        }

        .search-results {
            margin-bottom: 1.5rem;
        }

        .results-count, .no-results {
            font-size: 1rem;
        }

        .pagination {
            margin-top: 1.5rem;
            gap: 0.75rem;
        }

        .pagination-button {
            padding: 0.625rem 1rem;
            font-size: 1rem;
        }

        .page-info {
            font-size: 0.875rem;
            min-width: 120px;
        }

        .loading-container {
            min-height: 300px;
        }

        .loader {
            width: 40px;
            height: 40px;
        }
    }

    @media (max-width: 480px) {
        .movies-container {
            padding: 1rem;
        }

        .movies-grid {
            grid-template-columns: repeat(1, 1fr);
            gap: 1rem;
        }

        .title {
            font-size: 1.75rem;
            margin-bottom: 1.25rem;
        }

        .movie-card {
            max-width: 300px;
            margin: 0 auto;
        }

        .movie-info h3 {
            font-size: 1.125rem;
        }

        .movie-overview {
            font-size: 0.875rem;
        }

        .pagination {
            flex-wrap: wrap;
            justify-content: center;
        }

        .page-info {
            order: -1;
            width: 100%;
            margin-bottom: 0.75rem;
        }

        .loading-container {
            min-height: 250px;
        }
    }

    .favorite-button {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        color: white;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 2;
    }

    .favorite-button:hover {
        transform: scale(1.1);
        background: rgba(0, 0, 0, 0.7);
    }

    .favorite-button.is-favorite {
        color: #ff3e00;
    }

    .search-results {
        text-align: center;
        margin-bottom: 2rem;
        color: var(--text-muted, #888);
    }

    .no-results {
        color: var(--accent-color, #ff3e00);
        font-size: 1.1rem;
    }

    .results-count {
        font-size: 1.1rem;
    }
</style>  -->