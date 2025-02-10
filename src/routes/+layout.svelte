<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	
	const allMenuItems = [
		{ icon: '/icons/film.svg', href: '/films', label: 'Films' },
		{ icon: '/icons/trending.svg', href: '/tendances', label: 'Tendances' },
		{ icon: '/icons/star.svg', href: '/favoris', label: 'Favoris', requireAuth: true },
		{ icon: '/icons/category.svg', href: '/genres', label: 'Genres' },
		{ icon: '/icons/calendar.svg', href: '/prochainement', label: 'À venir' }
	];

	$: menuItems = allMenuItems.filter(item => !item.requireAuth || $auth.isAuthenticated);
	$: isHomePage = $page.url.pathname === '/';

	function handleLogout() {
		auth.logout();
		goto('/login');
	}
</script>

<div class="app-container">
	{#if !isHomePage}
	<aside class="sidebar">
		<div class="sidebar-content">
			<div class="logo-container">
				<p class="logo-emoji">🎬</p>
				<span class="app-title">CinéApp</span>
			</div>
			
			<nav class="nav-menu">
				{#each menuItems as item}
					{@const isActive = $page.url.pathname === item.href}
					<a 
						href={item.href}
						class="nav-link"
						class:active={isActive}
					>
						<img 
							src={item.icon} 
							alt={item.label}
							class="nav-icon"
							class:active={isActive}
						/>
						<span class="nav-label" class:active={isActive}>
							{item.label}
						</span>
					</a>
				{/each}
			</nav>
		</div>

		<div class="user-section">
			{#if $auth.isAuthenticated}
				<div class="user-info">
					<div class="user-avatar">
						{$auth.user?.username?.[0].toUpperCase() ?? '?'}
					</div>
					<div class="user-details">
						<span class="username">{$auth.user?.username}</span>
						<button class="logout-button" on:click={handleLogout}>
							Se déconnecter
						</button>
					</div>
				</div>
			{:else}
				<a href="/login" class="login-link">
					Se connecter
				</a>
			{/if}
		</div>
	</aside>
	{/if}

	<main class="main-content" class:no-sidebar={isHomePage}>
		<slot />
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
		color: white;
		background: #030712;
	}

	.app-container {
		display: flex;
		min-height: 100vh;
		background: #030712;
	}

	.sidebar {
		width: 260px;
		background: #0A0A0F;
		border-right: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: fixed;
	}

	.sidebar-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.logo-container {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-bottom: 2rem;
	}

	.logo-emoji {
		font-size: 2rem;
		margin: 0;
	}

	.app-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: white;
	}

	.nav-menu {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		gap: 0.75rem;
		text-decoration: none;
		color: rgba(255, 255, 255, 0.7);
		border-radius: 8px;
		transition: all 0.2s ease;
		position: relative;
	}

	.nav-link:hover {
		background: rgba(255, 255, 255, 0.05);
		color: white;
	}

	.nav-link.active {
		background: rgba(255, 62, 0, 0.1);
		color: white;
	}

	.nav-link.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 1.5rem;
		background: #ff3e00;
		border-radius: 0 2px 2px 0;
	}

	.nav-icon {
		width: 20px;
		height: 20px;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.nav-icon.active {
		opacity: 1;
	}

	.nav-label {
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.nav-label.active {
		color: white;
	}

	.user-section {
		margin-top: auto;
		padding-top: 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		background: var(--accent-color, #ff3e00);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: white;
		font-size: 0.875rem;
	}

	.user-details {
		flex: 1;
		min-width: 0;
	}

	.username {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: white;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-button {
		background: none;
		border: none;
		padding: 0;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.75rem;
		cursor: pointer;
		transition: color 0.2s ease;
	}

	.logout-button:hover {
		color: var(--accent-color, #ff3e00);
	}

	.login-link {
		display: block;
		text-align: center;
		color: var(--accent-color, #ff3e00);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.login-link:hover {
		background: rgba(255, 62, 0, 0.1);
	}

	.main-content {
		margin-left: 260px;
		flex: 1;
		min-height: 100vh;
	}

	.main-content.no-sidebar {
		margin-left: 0;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 80px;
			padding: 1rem 0.5rem;
		}

		.main-content {
			margin-left: 80px;
		}

		.main-content.no-sidebar {
			margin-left: 0;
		}

		.app-title {
			display: none;
		}

		.nav-link {
			padding: 0.75rem;
			justify-content: center;
		}

		.nav-label {
			display: none;
		}

		.user-details {
			display: none;
		}

		.user-info {
			justify-content: center;
			padding: 0.25rem;
		}

		.user-avatar {
			margin: 0;
		}
	}
</style>
