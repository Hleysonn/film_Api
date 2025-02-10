<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { goto } from '$app/navigation';

    let showContent = false;
    let showLogo = false;
    let showTagline = false;
    let showButtons = false;

    onMount(() => {
        // Séquence d'animation
        setTimeout(() => showLogo = true, 500);
        setTimeout(() => showTagline = true, 1500);
        setTimeout(() => showButtons = true, 2500);
        setTimeout(() => showContent = true, 300);
    });
</script>

{#if showContent}
<div class="splash-container" in:fade={{ duration: 1000 }}>
    <div class="splash-content">
        {#if showLogo}
            <div class="logo-container" in:fly={{ y: 50, duration: 1000 }}>
                <span class="logo-emoji">🎬</span>
                <h1 class="logo-text">CinéApp</h1>
            </div>
        {/if}

        {#if showTagline}
            <p class="tagline" in:fly={{ y: 20, duration: 1000 }}>
                Découvrez, partagez et collectionnez<br>
                vos films préférés
            </p>
        {/if}

        {#if showButtons}
            <div class="buttons-container" in:fly={{ y: 20, duration: 1000 }}>
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

    <div class="background-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
    </div>
</div>
{/if}

<style>
    .splash-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
        padding: 2rem;
    }

    .splash-content {
        text-align: center;
        z-index: 2;
        max-width: 600px;
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
    }

    .buttons-container {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .cta-button {
        padding: 1rem 2rem;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .cta-button.primary {
        background: #ff3e00;
        color: white;
        box-shadow: 0 4px 20px rgba(255, 62, 0, 0.3);
    }

    .cta-button.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(255, 62, 0, 0.4);
    }

    .cta-button.secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cta-button.secondary:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
    }

    .arrow {
        transition: transform 0.3s ease;
    }

    .cta-button:hover .arrow {
        transform: translateX(4px);
    }

    .background-decoration {
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 1;
    }

    .circle {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
    }

    .circle-1 {
        width: 400px;
        height: 400px;
        background: rgba(255, 62, 0, 0.15);
        top: -100px;
        right: -100px;
        animation: float 8s ease-in-out infinite;
    }

    .circle-2 {
        width: 300px;
        height: 300px;
        background: rgba(0, 150, 255, 0.1);
        bottom: -50px;
        left: -50px;
        animation: float 10s ease-in-out infinite reverse;
    }

    .circle-3 {
        width: 200px;
        height: 200px;
        background: rgba(255, 62, 0, 0.1);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 6s ease-in-out infinite;
    }

    @keyframes float {
        0%, 100% {
            transform: translate(0, 0);
        }
        50% {
            transform: translate(30px, 30px);
        }
    }

    @keyframes pulse {
        0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.8;
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
        }

        .cta-button {
            width: 100%;
            justify-content: center;
        }
    }
</style>
