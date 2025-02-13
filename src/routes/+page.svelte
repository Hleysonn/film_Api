<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly, scale } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { quintOut, elasticOut } from 'svelte/easing';

    let showContent = false;
    let showLogo = false;
    let showTagline = false;
    let showButtons = false;

    onMount(() => {
        // Démarrer immédiatement l'animation du fond
        showContent = true;
        
        // Séquence d'animations avec des délais plus naturels
        setTimeout(() => showLogo = true, 800);
        setTimeout(() => showTagline = true, 1600);
        setTimeout(() => showButtons = true, 2200);
    });
</script>

{#if showContent}
<div class="splash-container" in:fade={{ duration: 1500, easing: quintOut }}>
    <div class="splash-content">
        {#if showLogo}
            <div class="logo-container" in:fly={{ y: 30, duration: 1000, easing: quintOut }}>
                <span class="logo-emoji" in:scale={{ duration: 800, easing: elasticOut, delay: 200 }}>🎬</span>
                <h1 class="logo-text">CinéApp</h1>
            </div>
        {/if}

        {#if showTagline}
            <p class="tagline" in:fly={{ y: 20, duration: 800, easing: quintOut }}>
                Découvrez, partagez et collectionnez<br>
                vos films préférés
            </p>
        {/if}

        {#if showButtons}
            <div class="buttons-container" in:fly={{ y: 20, duration: 800, easing: quintOut }}>
                <a href="/films" class="cta-button primary">
                    Explorer les films
                    <span class="arrow">→</span>
                </a>
                <a href="/tendances" class="cta-button secondary">
                    Voir les tendances
                </a>
            </div>
        {/if}
    </div>

    <div class="signature">
        App de cinéma codée par Franzy pour le cours de SVELTE
    </div>

    <div class="background-decoration">
        <!-- Petites particules lumineuses -->
        {#each Array(15) as _, i}
            <div class="light-particle small" 
                 style="
                    --delay: {Math.random() * -30}s;
                    --size: {4 + Math.random() * 6}px;
                    --start-x: {Math.random() * 100}%;
                    --start-y: {Math.random() * 100}%;
                    --travel-distance: {150 + Math.random() * 200}px;
                    --opacity: {0.4 + Math.random() * 0.3};
                 "
            ></div>
        {/each}

        <!-- Particules moyennes -->
        {#each Array(12) as _, i}
            <div class="light-particle medium" 
                 style="
                    --delay: {Math.random() * -30}s;
                    --size: {8 + Math.random() * 12}px;
                    --start-x: {Math.random() * 100}%;
                    --start-y: {Math.random() * 100}%;
                    --travel-distance: {100 + Math.random() * 150}px;
                    --opacity: {0.6 + Math.random() * 0.3};
                 "
            ></div>
        {/each}

        <!-- Grosses particules -->
        {#each Array(8) as _, i}
            <div class="light-particle large" 
                 style="
                    --delay: {Math.random() * -30}s;
                    --size: {15 + Math.random() * 20}px;
                    --start-x: {Math.random() * 100}%;
                    --start-y: {Math.random() * 100}%;
                    --travel-distance: {50 + Math.random() * 100}px;
                    --opacity: {0.2 + Math.random() * 0.4};
                 "
            ></div>
        {/each}

        <svg class="cinema-decoration" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <!-- Effet de lumière de base -->
            <radialGradient id="spotlight" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style="stop-color: rgba(255, 62, 0, 0.08);" />
                <stop offset="100%" style="stop-color: rgba(255, 62, 0, 0);" />
            </radialGradient>
            
            <circle cx="500" cy="500" r="400" 
                    fill="url(#spotlight)"
                    class="light-effect" />

            <!-- Effet de lumière qui traverse -->
            <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color: rgba(255, 62, 0, 0);" />
                <stop offset="50%" style="stop-color: rgba(255, 62, 0, 0.1);" />
                <stop offset="100%" style="stop-color: rgba(255, 62, 0, 0);" />
            </linearGradient>

            <rect width="200%" height="200%" 
                  fill="url(#beam)"
                  class="moving-light"
                  transform="rotate(-45)" />
        </svg>
    </div>
</div>
{/if}

<style>
    .splash-container {
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
    }

    .splash-content {
        text-align: center;
        z-index: 2;
        max-width: 600px;
        padding: 2rem;
    }

    .logo-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .logo-emoji {
        font-size: 4rem;
        filter: drop-shadow(0 0 10px rgba(255, 62, 0, 0.3));
        display: inline-block;
        transform-origin: center;
    }

    .logo-text {
        font-size: 4rem;
        font-weight: 800;
        margin: 0;
        background: linear-gradient(to right, #fff, #ff3e00);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 10px rgba(255, 62, 0, 0.2));
    }

    .tagline {
        font-size: 1.5rem;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 3rem;
        line-height: 1.6;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .buttons-container {
        display: flex;
        gap: 1.5rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .cta-button {
        padding: 1.2rem 2.5rem;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .cta-button.primary {
        background: #ff3e00;
        color: white;
        box-shadow: 0 4px 20px rgba(255, 62, 0, 0.3);
    }

    .cta-button.primary:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 25px rgba(255, 62, 0, 0.4);
    }

    .cta-button.secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
    }

    .cta-button.secondary:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-3px);
    }

    .arrow {
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cta-button:hover .arrow {
        transform: translateX(6px);
    }

    .background-decoration {
        position: fixed;
        inset: 0;
        overflow: hidden;
        z-index: 1;
    }

    .cinema-decoration {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 0;
        opacity: 0.8;
    }

    .moving-light {
        animation: light-move 8s linear infinite;
        transform-origin: center;
        opacity: 0.6;
        mix-blend-mode: screen;
    }

    @keyframes light-move {
        0% {
            transform: rotate(-45deg) translate(-100%, -50%);
        }
        100% {
            transform: rotate(-45deg) translate(0%, -50%);
        }
    }

    .light-effect {
        animation: subtle-pulse 10s ease-in-out infinite;
    }

    @keyframes subtle-pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 0.8;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.6;
        }
    }

    @media (max-width: 768px) {
        .logo-text {
            font-size: 3rem;
        }

        .logo-emoji {
            font-size: 3rem;
        }

        .tagline {
            font-size: 1.2rem;
            padding: 0 1rem;
        }

        .buttons-container {
            flex-direction: column;
            padding: 0 1rem;
            gap: 1rem;
        }

        .cta-button {
            width: 100%;
            justify-content: center;
            padding: 1rem 2rem;
        }

        .signature {
            font-size: 0.75rem;
            padding: 0 1rem;
        }
    }

    .light-particle {
        position: absolute;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        pointer-events: none;
        left: var(--start-x);
        top: var(--start-y);
        animation: float-particle 15s linear infinite;
        animation-delay: var(--delay);
    }

    .light-particle.small {
        background: radial-gradient(circle at center, rgba(255, 62, 0, var(--opacity)), rgba(255, 62, 0, 0) 60%);
        filter: blur(1px);
        animation-duration: 20s;
    }

    .light-particle.medium {
        background: radial-gradient(circle at center, rgba(255, 62, 0, var(--opacity)), rgba(255, 62, 0, 0) 70%);
        filter: blur(2px);
        animation-duration: 15s;
    }

    .light-particle.large {
        background: radial-gradient(circle at center, rgba(255, 62, 0, var(--opacity)), rgba(255, 62, 0, 0) 80%);
        filter: blur(3px);
        animation-duration: 25s;
    }

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

    .signature {
        position: absolute;
        bottom: 2rem;
        left: 0;
        right: 0;
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.875rem;
        z-index: 2;
    }
</style>
