<script lang="ts">
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/stores/auth';
    import { usersStore } from '$lib/stores/users';

    let email = '';
    let password = '';
    let rememberMe = false;
    let isLoading = false;
    let error: string | null = null;

    async function handleLogin(e: SubmitEvent) {
        e.preventDefault();
        isLoading = true;
        error = null;

        try {
            // Authentifier l'utilisateur
            const user = await usersStore.authenticate(email, password);
            
            // Mettre à jour le store d'authentification
            auth.login({
                id: user.id,
                username: user.username,
                email: user.email
            });

            // Si "Se souvenir de moi" est coché, sauvegarder dans localStorage
            if (rememberMe) {
                localStorage.setItem('auth', JSON.stringify({
                    id: user.id,
                    username: user.username,
                    email: user.email
                }));
            }
            
            // Rediriger vers la page des favoris
            goto('/favoris');
        } catch (err) {
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = "Une erreur est survenue lors de la connexion";
            }
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="login-container" in:fade>
    <div class="login-card">
        <div class="card-header">
            <h1>Connexion</h1>
            <p>Bienvenue sur CinéApp ! 👋</p>
        </div>

        {#if error}
            <div class="error-message" transition:fade>
                {error}
            </div>
        {/if}

        <form on:submit={handleLogin} class="login-form">
            <div class="form-group">
                <label for="email">Email</label>
                <input 
                    type="email" 
                    id="email"
                    bind:value={email}
                    placeholder="votre@email.com"
                    required
                />
            </div>

            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input 
                    type="password" 
                    id="password"
                    bind:value={password}
                    placeholder="••••••••"
                    required
                />
            </div>

            <div class="form-options">
                <label class="remember-me">
                    <input 
                        type="checkbox"
                        bind:checked={rememberMe}
                    />
                    <span>Se souvenir de moi</span>
                </label>
                <a href="/reset-password" class="forgot-password">
                    Mot de passe oublié ?
                </a>
            </div>

            <button type="submit" class="submit-button" disabled={isLoading}>
                {#if isLoading}
                    <div class="button-loader"></div>
                {:else}
                    Se connecter
                {/if}
            </button>
        </form>

        <div class="card-footer">
            <p>Pas encore de compte ?</p>
            <a href="/register" class="register-link">Créer un compte</a>
        </div>
    </div>
</div>

<style>
    .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: linear-gradient(135deg, #1a1a2e 0%, #0F0F1A 100%);
    }

    .login-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 2.5rem;
        width: 100%;
        max-width: 420px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .card-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .card-header h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(to right, #fff, #ff3e00);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .card-header p {
        color: rgba(255, 255, 255, 0.7);
        margin: 0.5rem 0 0;
    }

    .login-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9375rem;
        font-weight: 500;
    }

    .form-group input {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        color: white;
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    .form-group input:focus {
        outline: none;
        border-color: #ff3e00;
        background: rgba(255, 255, 255, 0.1);
    }

    .form-group input::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }

    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
    }

    .remember-me {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
    }

    .forgot-password {
        color: #ff3e00;
        text-decoration: none;
        transition: opacity 0.2s ease;
    }

    .forgot-password:hover {
        opacity: 0.8;
    }

    .submit-button {
        background: #ff3e00;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.875rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48px;
    }

    .submit-button:hover {
        background: #ff5722;
    }

    .submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .button-loader {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .card-footer {
        margin-top: 2rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
    }

    .card-footer p {
        margin: 0;
    }

    .register-link {
        color: #ff3e00;
        text-decoration: none;
        font-weight: 500;
        margin-left: 0.5rem;
        transition: opacity 0.2s ease;
    }

    .register-link:hover {
        opacity: 0.8;
    }

    .error-message {
        background: rgba(255, 62, 0, 0.1);
        color: #ff3e00;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 480px) {
        .login-container {
            padding: 1rem;
        }

        .login-card {
            padding: 1.5rem;
        }

        .form-options {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
    }
</style> 