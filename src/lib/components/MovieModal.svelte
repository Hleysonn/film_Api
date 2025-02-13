<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth';
    import { votesStore } from '$lib/stores/votes';
    import { goto } from '$app/navigation';
    import '../../styles/modal.css';
    
    interface Actor {
        id: number;
        name: string;
        character: string;
        profile_path: string | null;
        biography?: string;
        birthday?: string;
        place_of_birth?: string;
        deathday?: string | null;
        known_for_department?: string;
    }
    
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
    let cast: Actor[] = [];
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
            
            // 3 acteurs MAX
            const mainCast = data.cast.slice(0, 3);
            
            // détails acteur complets
            const actorsWithDetails = await Promise.all(
                mainCast.map(async (actor: { id: number; name: string; character: string; profile_path: string | null; biography?: string; birthday?: string; place_of_birth?: string; deathday?: string | null; known_for_department?: string }) => {
                    try {
                        const detailsResponse = await fetch(
                            `${import.meta.env.VITE_TMDB_API_URL}/person/${actor.id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=fr-FR`
                        );
                        const details = await detailsResponse.json();
                        
                     
                        return {
                            ...actor,
                            biography: details.biography,
                            birthday: details.birthday,
                            place_of_birth: details.place_of_birth,
                            deathday: details.deathday,
                            known_for_department: details.known_for_department,
                            profile_path: details.profile_path || actor.profile_path
                        };
                    } catch (error) {
                        console.error(`Erreur lors du chargement des détails de l'acteur ${actor.id}:`, error);
                        return actor;
                    }
                })
            );
            
            cast = actorsWithDetails;
        } catch (error) {
            console.error('Erreur lors du chargement des acteurs:', error);
        } finally {
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

    function navigateToActor(actorId: number) {
        onClose(); 
        goto(`/acteur/${actorId}`);
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
                            <div class="cast-list">
                                {#each cast as actor}
                                    <div 
                                        class="cast-item" 
                                        on:click={() => navigateToActor(actor.id)}
                                        on:keydown={(e) => e.key === 'Enter' && navigateToActor(actor.id)}
                                        tabindex="0"
                                        role="button"
                                    >
                                        <img 
                                            src={actor.profile_path ? `https://image.tmdb.org/t/p/w45${actor.profile_path}` : '/placeholder-avatar.png'} 
                                            alt={actor.name}
                                            class="cast-avatar"
                                        />
                                        <div class="cast-info">
                                            <p class="cast-name">{actor.name}</p>
                                            <p class="cast-character">{actor.character}</p>
                                        </div>
                                    </div>
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
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 2rem;
        box-sizing: border-box;
        backdrop-filter: blur(8px);
    }

    .modal-content {
        background: var(--bg-primary);
        color: var(--text-primary);
        border-radius: 1rem;
        width: 100%;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 1px solid var(--border-color);
    }

    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--text-secondary);
        cursor: pointer;
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    .close-button:hover {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .modal-grid {
        display: grid;
        grid-template-columns: minmax(300px, 2fr) 3fr;
        gap: 2rem;
        padding: 2rem;
    }

    .modal-media {
        position: relative;
        border-radius: 0.75rem;
        overflow: hidden;
        background: var(--bg-secondary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .modal-media img {
        width: 100%;
        height: auto;
        display: block;
        border-radius: 0.75rem;
    }

    .modal-info {
        color: var(--text-primary);
    }

    .modal-info h2 {
        font-size: 2rem;
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
    }

    .original-title {
        color: var(--text-secondary);
        font-style: italic;
        margin: 0 0 1rem 0;
    }

    .rating-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1rem 0;
    }

    .rating {
        display: flex;
        align-items: baseline;
        color: var(--accent-color);
    }

    .rating-value {
        font-size: 2rem;
        font-weight: bold;
    }

    .rating-max {
        color: var(--text-secondary);
        margin-left: 0.25rem;
    }

    .vote-count {
        color: var(--text-secondary);
    }

    .overview {
        margin: 2rem 0;
        color: var(--text-primary);
    }

    .overview h3 {
        margin-bottom: 1rem;
        color: var(--text-primary);
    }

    .overview p {
        line-height: 1.6;
        color: var(--text-secondary);
    }

    .release-date {
        color: var(--text-secondary);
        margin: 1rem 0;
    }

    .video-container {
        position: relative;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
    }

    .video-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
    }

    .cast-section {
        margin-top: 2rem;
    }

    .cast-section h3 {
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    .cast-list {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .cast-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--bg-secondary);
        border-radius: 0.75rem;
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .cast-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--card-hover-shadow);
        background: var(--hover-bg);
    }

    .cast-item:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--accent-color);
    }

    .cast-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }

    .cast-info {
        display: flex;
        flex-direction: column;
    }

    .cast-name {
        color: var(--text-primary);
        font-weight: 500;
    }

    .cast-character {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .user-rating {
        margin: 2rem 0;
    }

    .user-rating h3 {
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    .stars-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .star-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-secondary);
        transition: color 0.3s ease;
        padding: 0.25rem;
    }

    .star-button:hover,
    .star-button.active {
        color: var(--accent-color);
    }

    .submit-vote {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        margin-left: 1rem;
    }

    .submit-vote:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    .submit-vote:disabled {
        background: var(--text-secondary);
        cursor: not-allowed;
        transform: none;
    }

    .vote-message {
        margin-top: 0.5rem;
        color: var(--accent-color);
        font-weight: 500;
    }

    @media (max-width: 768px) {
        .modal-grid {
            grid-template-columns: 1fr;
        }

        .modal-content {
            margin: 0;
            max-height: 100vh;
            border-radius: 0;
        }

        .modal-backdrop {
            padding: 0;
        }

        .cast-list {
            gap: 0.5rem;
        }

        .cast-item {
            flex: 1 1 calc(50% - 0.5rem);
        }
    }
</style> 