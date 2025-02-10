<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth';
    import { votesStore } from '$lib/stores/votes';
    
    export let movie: {
        id: number;
        title: string;
        overview: string;
        poster_path: string;
        vote_average: number;
        release_date: string;
        original_title: string;
        vote_count: number;
    };
    export let isOpen: boolean;
    export let onClose: () => void;

    let videoKey: string | null = null;
    let loading = true;
    let cast: any[] = [];
    let selectedRating = $votesStore[movie.id] || 0;
    let isVoting = false;
    let voteMessage = '';
    let guestSessionId: string | null = null;

    function updateRating(rating: number) {
        selectedRating = rating;
    }

    async function fetchTrailer() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/movie/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR`
            );
            const data = await response.json();
            // Chercher d'abord une bande-annonce en français
            let trailer = data.results.find(
                (video: any) => 
                    video.type === "Trailer" && 
                    video.site === "YouTube" && 
                    video.iso_639_1 === "fr"
            );
            
            // Si pas de bande-annonce en français, prendre une en anglais
            if (!trailer) {
                trailer = data.results.find(
                    (video: any) => 
                        video.type === "Trailer" && 
                        video.site === "YouTube"
                );
            }
            
            videoKey = trailer?.key || null;
        } catch (e) {
            console.error("Erreur lors du chargement de la bande-annonce", e);
        } finally {
            loading = false;
        }
    }

    async function loadCast() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/movie/${movie.id}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR`
            );
            const data = await response.json();
            cast = data.cast.slice(0, 5); // On prend les 5 premiers acteurs
            loading = false;
        } catch (error) {
            console.error('Erreur lors du chargement des acteurs:', error);
            loading = false;
        }
    }

    async function createGuestSession() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/authentication/guest_session/new?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
            );
            const data = await response.json();
            if (data.success) {
                guestSessionId = data.guest_session_id;
            }
        } catch (error) {
            console.error('Erreur lors de la création de la session invité:', error);
        }
    }

    async function submitVote() {
        if (!$auth.isAuthenticated) {
            voteMessage = 'Connectez-vous pour voter';
            return;
        }

        try {
            isVoting = true;

            if (!guestSessionId) {
                await createGuestSession();
            }

            if (!guestSessionId) {
                throw new Error('Impossible de créer une session');
            }

            const response = await fetch(
                `${import.meta.env.VITE_TMDB_API_URL}/movie/${movie.id}/rating?api_key=${import.meta.env.VITE_TMDB_API_KEY}&guest_session_id=${guestSessionId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        value: selectedRating
                    })
                }
            );
            
            const data = await response.json();
            
            if (data.success) {
                // Sauvegarder le vote localement
                votesStore.addVote(movie.id, selectedRating);
                voteMessage = 'Vote enregistré !';
                setTimeout(() => voteMessage = '', 3000);
            } else {
                throw new Error(data.status_message || 'Erreur lors du vote');
            }
        } catch (error) {
            console.error('Erreur lors du vote:', error);
            voteMessage = 'Erreur lors du vote';
        } finally {
            isVoting = false;
        }
    }

    onMount(async () => {
        if (isOpen) {
            fetchTrailer();
            loadCast();
            await createGuestSession();
        }
    });

    function handleEscape(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            onClose();
        }
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
</script>

<svelte:window on:keydown={handleEscape}/>

{#if isOpen}
    <div class="modal-backdrop" on:click={handleBackdropClick} transition:fade={{ duration: 200 }}>
        <div class="modal-content" transition:scale={{ duration: 300, start: 0.95 }}>
            <button class="close-button" on:click={onClose}>×</button>
            
            <div class="modal-grid">
                <div class="modal-media">
                    {#if videoKey}
                        <div class="video-container">
                            <iframe
                                title="Bande annonce"
                                src={`https://www.youtube.com/embed/${videoKey}?autoplay=0`}
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            ></iframe>
                        </div>
                    {:else}
                        <img 
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                            alt={movie.title}
                        />
                    {/if}
                </div>
                
                <div class="modal-info">
                    <h2>{movie.title}</h2>
                    {#if movie.original_title !== movie.title}
                        <p class="original-title">Titre original : {movie.original_title}</p>
                    {/if}
                    
                    <div class="rating-container">
                        <div class="rating">
                            <span class="rating-value">{movie.vote_average.toFixed(1)}</span>
                            <span class="rating-max">/10</span>
                        </div>
                        <span class="vote-count">({movie.vote_count} votes)</span>
                    </div>

                    <div class="user-rating">
                        <h3>Voter</h3>
                        <div class="stars-container">
                            {#each Array(10) as _, i}
                                <button 
                                    class="star-button"
                                    class:active={i < selectedRating}
                                    on:click={() => updateRating(i + 1)}
                                    disabled={isVoting}
                                >
                                    ★
                                </button>
                            {/each}
                            {#if selectedRating > 0}
                                <button 
                                    class="submit-vote" 
                                    on:click={submitVote}
                                    disabled={isVoting}
                                >
                                    {#if isVoting}
                                        ...
                                    {:else}
                                        Voter
                                    {/if}
                                </button>
                            {/if}
                        </div>
                        {#if voteMessage}
                            <p class="vote-message" transition:fade>
                                {voteMessage}
                            </p>
                        {/if}
                    </div>
                    
                    <p class="release-date">
                        Date de sortie : {new Date(movie.release_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                    
                    <div class="overview">
                        <h3>Synopsis</h3>
                        <p>{movie.overview || "Aucun synopsis disponible."}</p>
                    </div>

                    {#if !loading && cast.length > 0}
                        <div class="cast-section">
                            <h3>Acteurs</h3>
                            <div class="cast-pills">
                                {#each cast.slice(0, 3) as actor}
                                    <a 
                                        href={`https://www.themoviedb.org/person/${actor.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        class="actor-pill"
                                    >
                                        {actor.name}
                                    </a>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        z-index: 1000;
        backdrop-filter: blur(5px);
    }

    .modal-content {
        background: var(--card-bg, #1a1a1a);
        border-radius: 16px;
        width: 100%;
        max-width: 1000px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: var(--text-color, white);
        font-size: 2rem;
        cursor: pointer;
        z-index: 2;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .close-button:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .modal-grid {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 2rem;
        padding: 2rem;
    }

    .modal-media {
        width: 100%;
        max-width: 500px;
    }

    .modal-media img {
        width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .modal-info {
        color: var(--text-color, white);
    }

    .modal-info h2 {
        font-size: 2rem;
        margin: 0 0 0.5rem 0;
        line-height: 1.2;
    }

    .original-title {
        color: var(--text-muted, #888);
        font-style: italic;
        margin: 0 0 1rem 0;
    }

    .rating-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1.5rem 0;
    }

    .rating {
        background: var(--accent-color, #ff3e00);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        display: inline-flex;
        align-items: baseline;
        gap: 0.2rem;
    }

    .rating-value {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .rating-max {
        opacity: 0.8;
    }

    .vote-count {
        color: var(--text-muted, #888);
    }

    .overview {
        margin-top: 2rem;
    }

    .overview h3 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
        color: var(--accent-color, #ff3e00);
    }

    .overview p {
        line-height: 1.6;
    }

    .video-container {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
        height: 0;
        overflow: hidden;
        border-radius: 8px;
    }

    .video-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .cast-section {
        margin-top: 1.5rem;
    }

    .cast-section h3 {
        font-size: 1.3rem;
        margin-bottom: 0.75rem;
        color: var(--accent-color, #ff3e00);
    }

    .cast-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .actor-pill {
        background: rgba(255, 62, 0, 0.1);
        color: var(--accent-color, #ff3e00);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        text-decoration: none;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 62, 0, 0.2);
    }

    .actor-pill:hover {
        background: rgba(255, 62, 0, 0.2);
        transform: translateY(-1px);
    }

    .user-rating {
        margin: 1.5rem 0;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
    }

    .user-rating h3 {
        font-size: 1.1rem;
        margin-bottom: 1rem;
        color: var(--accent-color, #ff3e00);
    }

    .stars-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .star-button {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.2);
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
        line-height: 1;
    }

    .star-button:hover,
    .star-button.active {
        color: #ff3e00;
        transform: scale(1.1);
    }

    .submit-vote {
        background: #ff3e00;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: 1rem;
    }

    .submit-vote:hover:not(:disabled) {
        background: #ff5722;
        transform: translateY(-1px);
    }

    .submit-vote:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .vote-message {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: var(--accent-color, #ff3e00);
    }

    @media (max-width: 768px) {
        .modal-grid {
            grid-template-columns: 1fr;
        }

        .modal-media {
            max-width: 300px;
            margin: 0 auto;
        }

        .modal-content {
            margin: 1rem;
        }

        .modal-media img {
            border-radius: 12px 12px 0 0;
            max-height: 400px;
        }

        .modal-info {
            padding: 1.5rem;
        }

        .cast-pills {
            flex-wrap: wrap;
            gap: 0.5rem;
        }
    }
</style> 