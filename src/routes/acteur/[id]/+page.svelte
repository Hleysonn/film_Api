<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { fade } from 'svelte/transition';
    import MovieModal from '$lib/components/MovieModal.svelte';
    import '../../../styles/acteur.css';

    interface Actor {
        id: number;
        name: string;
        profile_path: string;
        biography: string;
        birthday: string;
        deathday: string | null;
        place_of_birth: string;
        known_for_department: string;
    }

    interface Movie {
        id: number;
        title: string;
        poster_path: string;
        character: string;
        release_date: string;
        overview: string;
        vote_average: number;
        vote_count: number;
        original_title: string;
    }

    let actor: Actor | null = null;
    let movies: Movie[] = [];
    let loading = true;
    let error: string | null = null;
    let selectedMovie: Movie | null = null;
    let isModalOpen = false;

    function openModal(movie: Movie) {
        selectedMovie = movie;
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        selectedMovie = null;
    }

    async function loadActorDetails() {
        try {
            const actorId = $page.params.id;
            const response = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/person/${actorId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR`
            );
            const data = await response.json();
            actor = data;

            // Charger les films de l'acteur
            const creditsResponse = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/person/${actorId}/movie_credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR`
            );
            const creditsData = await creditsResponse.json();
            
            // Pour chaque film, récupérer les détails complets
            const moviesWithDetails = await Promise.all(
                creditsData.cast
                    .sort((a: Movie, b: Movie) => 
                        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
                    )
                    .slice(0, 12)
                    .map(async (movie: Movie) => {
                        try {
                            const movieResponse = await fetch(
                                `${import.meta.env.VITE_TMDB_API_URL}/movie/${movie.id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR`
                            );
                            const movieData = await movieResponse.json();
                            return {
                                ...movie,
                                overview: movieData.overview,
                                vote_count: movieData.vote_count,
                                original_title: movieData.original_title
                            };
                        } catch (error) {
                            console.error(`Erreur lors du chargement des détails du film ${movie.id}:`, error);
                            return movie;
                        }
                    })
            );
            
            movies = moviesWithDetails;
        } catch (e) {
            error = "Erreur lors du chargement des données";
        } finally {
            loading = false;
        }
    }

    function formatDate(dateStr: string | null) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function translateDepartment(department: string): string {
        const translations: { [key: string]: string } = {
            'Acting': 'Acteur',
            'Directing': 'Réalisation',
            'Writing': 'Scénario',
            'Production': 'Production',
            'Sound': 'Son',
            'Camera': 'Caméra',
            'Editing': 'Montage',
            'Art': 'Direction artistique',
            'Costume & Make-Up': 'Costumes & Maquillage',
            'Visual Effects': 'Effets visuels',
            'Crew': 'Équipe technique',
            'Lighting': 'Éclairage'
        };
        return translations[department] || department;
    }

    onMount(loadActorDetails);
</script>

<div class="actor-container">
    {#if loading}
        <div class="loading-container">
            <div class="loader"></div>
            <p>Chargement des informations...</p>
        </div>
    {:else if error}
        <div class="error-container">
            <p>{error}</p>
        </div>
    {:else if actor}
        <div class="actor-header" transition:fade>
            <div class="actor-profile">
                <img 
                    src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`} 
                    alt={actor.name}
                    class="profile-image"
                />
                <div class="actor-info">
                    <h1>{actor.name}</h1>
                    {#if actor.birthday}
                        <p class="birth-info">
                            Né(e) le {formatDate(actor.birthday)}
                            {#if actor.place_of_birth}
                                à {actor.place_of_birth}
                            {/if}
                            {#if actor.deathday}
                                <br>
                                Décédé(e) le {formatDate(actor.deathday)}
                            {/if}
                        </p>
                    {/if}
                    <p class="department">
                        Rôle : {translateDepartment(actor.known_for_department)}
                    </p>
                </div>
            </div>
        </div>

        {#if actor.biography}
            <div class="biography-section" transition:fade={{ delay: 200 }}>
                <h2>Biographie</h2>
                <p class="biography">{actor.biography || "Aucune biographie disponible."}</p>
            </div>
        {/if}

        {#if movies.length > 0}
            <div class="filmography-section" transition:fade={{ delay: 400 }}>
                <h2>Filmographie</h2>
                <div class="movies-grid">
                    {#each movies as movie}
                        <div class="movie-card" on:click={() => openModal(movie)}>
                            <div class="movie-poster">
                                <img 
                                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                                    alt={movie.title}
                                    loading="lazy"
                                />
                            </div>
                            <div class="movie-info">
                                <h3>{movie.title}</h3>
                                <p class="character">{movie.character}</p>
                                {#if movie.release_date}
                                    <p class="release-date">{new Date(movie.release_date).getFullYear()}</p>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
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
    .actor-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
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
        border-top-color: var(--accent-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .error-container {
        text-align: center;
        color: var(--accent-color);
        padding: 2rem;
    }

    .actor-header {
        margin-bottom: 3rem;
    }

    .actor-profile {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 2rem;
        align-items: start;
    }

    .profile-image {
        width: 100%;
        border-radius: 1rem;
        box-shadow: var(--card-shadow);
    }

    .actor-info {
        padding: 1rem 0;
    }

    .actor-info h1 {
        font-size: 2.5rem;
        margin: 0 0 1rem 0;
        color: var(--text-primary);
    }

    .birth-info {
        color: var(--text-secondary);
        font-size: 1.1rem;
        margin: 0.5rem 0;
    }

    .department {
        color: var(--accent-color);
        font-size: 1.1rem;
        margin: 1rem 0;
    }

    .biography-section {
        margin: 2rem 0;
    }

    .biography-section h2 {
        font-size: 1.8rem;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    .biography {
        color: var(--text-secondary);
        line-height: 1.8;
        font-size: 1.1rem;
        white-space: pre-line;
    }

    .filmography-section {
        margin: 3rem 0;
    }

    .filmography-section h2 {
        font-size: 1.8rem;
        color: var(--text-primary);
        margin-bottom: 2rem;
    }

    .movies-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 2rem;
    }

    .movie-card {
        background: var(--card-bg);
        border-radius: 1rem;
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
        box-shadow: var(--card-shadow);
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
    }

    .movie-info {
        padding: 1rem;
    }

    .movie-info h3 {
        color: var(--text-primary);
        font-size: 1rem;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .character {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin: 0.5rem 0;
        font-style: italic;
    }

    .release-date {
        color: var(--accent-color);
        font-size: 0.9rem;
        margin: 0;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 768px) {
        .actor-container {
            padding: 1rem;
        }

        .actor-profile {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .profile-image {
            max-width: 300px;
            margin: 0 auto;
        }

        .actor-info h1 {
            font-size: 2rem;
            text-align: center;
        }

        .birth-info, .department {
            text-align: center;
        }

        .movies-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
        }
    }
</style>  -->