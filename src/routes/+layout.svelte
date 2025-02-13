<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { fade, slide } from 'svelte/transition';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { searchQuery } from '$lib/stores/search';
	import { theme } from '$lib/stores/theme';
	

	let isSidebarOpen = false;
	
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

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		$searchQuery = target.value;
	}

	function toggleTheme() {
		theme.update(t => t === 'dark' ? 'light' : 'dark');
	}
</script>

<div class="app-container">
	{#if !isHomePage}
	<button class="menu-toggle" on:click={toggleSidebar}>
		<span class="hamburger"></span>
	</button>

	<aside class="sidebar" class:open={isSidebarOpen} transition:slide>
		<div class="sidebar-content">
			<div class="logo-container">
				<p class="logo-emoji">🎬</p>
				<span class="app-title">CinéApp</span>
			</div>

			<div class="search-container">
				<div class="search-wrapper">
					<img src="/icons/search.svg" alt="Rechercher" class="search-icon" />
					<input 
						type="text" 
						placeholder="Rechercher un film..." 
						class="search-input"
						value={$searchQuery}
						on:input={handleSearch}
					/>
				</div>
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
			<button class="theme-toggle" on:click={toggleTheme}>
				{#if $theme === 'dark'}
					🌙
				{:else}
					☀️
				{/if}
			</button>
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

	<div class="sidebar-overlay" class:visible={isSidebarOpen} on:click={toggleSidebar}></div>
	{/if}

	<div class="content-wrapper">
		<main class="main-content" class:no-sidebar={isHomePage}>
			<slot />
		</main>

		{#if !isHomePage}
		<footer class="footer">
			<div class="footer-content">
				<div class="footer-section brand">
					<div class="footer-logo">
						<span class="footer-emoji">🎬</span>
						<h4>CinéApp</h4>
					</div>
					<p>Découvrez, explorez et partagez le meilleur du cinéma</p>
				</div>
				
				<div class="footer-section">
					<h4>Menu</h4>
					<nav class="footer-nav">
						{#each menuItems as item}
							<a href={item.href}>
								<img src={item.icon} alt={item.label} class="footer-icon" />
								{item.label}
							</a>
						{/each}
					</nav>
				</div>
				
				<div class="footer-section">
					<h4>Réseaux sociaux</h4>
					<div class="social-links">
						<a href="#" class="social-link" title="Twitter">
							<img src="/icons/twitter.svg" alt="Twitter" />
						</a>
						<a href="#" class="social-link" title="Instagram">
							<img src="/icons/instagram.svg" alt="Instagram" />
						</a>
						<a href="https://www.facebook.com/themoviedb/?locale=fr_FR" class="social-link" title="Facebook">
							<img src="/icons/facebook.svg" alt="Facebook" />
						</a>
					</div>
				</div>
			</div>
			<div class="footer-bottom">
				<p>© {new Date().getFullYear()} CinéApp</p>
				<a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" class="tmdb-link">
					Propulsé par TMDB
				</a>
			</div>
		</footer>
		{/if}
	</div>
</div>

 <style>
	:global(:root) {
		--bg-primary: #030712;
		--bg-secondary: #0A0A0F;
		--text-primary: #FFFFFF;
		--text-secondary: rgba(255, 255, 255, 0.7);
		--border-color: rgba(255, 255, 255, 0.1);
		--accent-color: #ff3e00;
		--card-bg: #1a1a1a;
		--hover-bg: rgba(255, 255, 255, 0.05);
		--input-bg: rgba(255, 255, 255, 0.05);
		--input-border: rgba(255, 255, 255, 0.1);
		--icon-filter: invert(1);
		--menu-icon-opacity: 0.7;
	}

	:global(:root.light) {
		--bg-primary: #f8fafc;
		--bg-secondary: #ffffff;
		--text-primary: #1e293b;
		--text-secondary: #475569;
		--border-color: #e2e8f0;
		--accent-color: #ff3e00;
		--card-bg: #ffffff;
		--hover-bg: #f1f5f9;
		--input-bg: #ffffff;
		--input-border: #cbd5e1;
		--icon-filter: invert(0.3);
		--menu-icon-opacity: 0.8;
		--sidebar-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
		--card-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
		--card-hover-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		--card-border: #e2e8f0;
		--overlay-bg: rgba(0, 0, 0, 0.7);
		--overlay-text: #ffffff;
	}

	:global(html, body) {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
		color: var(--text-primary);
		background: var(--bg-primary);
	}

	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	.app-container {
		display: flex;
		min-height: 100vh;
		background: var(--bg-primary);
		width: 100%;
		position: relative;
	}

	.content-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin-left: 260px;
		min-height: 100vh;
	}

	.sidebar {
		width: 260px;
		background: var(--bg-secondary);
		border-right: 1px solid var(--border-color);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: fixed;
		box-shadow: var(--sidebar-shadow);
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
		color: var(--text-primary);
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
		color: var(--text-secondary);
		border-radius: 8px;
		transition: all 0.2s ease;
		position: relative;
	}

	.nav-link:hover {
		background: var(--hover-bg);
		color: var(--accent-color);
	}

	.nav-link.active {
		background: var(--hover-bg);
		color: var(--accent-color);
		font-weight: 600;
		border: 1px solid var(--border-color);
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
		width: 24px;
		height: 24px;
		opacity: var(--menu-icon-opacity);
		transition: all 0.3s ease;
		filter: var(--icon-filter);
	}

	.nav-link[href="/films"] .nav-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(300deg);
	}

	.nav-link[href="/tendances"] .nav-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(0deg);
	}

	.nav-link[href="/favoris"] .nav-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(330deg);
	}

	.nav-link[href="/genres"] .nav-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(100deg);
	}

	.nav-link[href="/prochainement"] .nav-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(180deg);
	}

	.nav-link:hover .nav-icon {
		transform: scale(1.1);
		opacity: 1;
	}

	.nav-icon.active {
		opacity: 1;
		transform: scale(1.2);
		filter: drop-shadow(0 0 8px var(--active-color));
	}

	.nav-link:hover::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at center, 
			rgba(255, 255, 255, 0.1) 0%, 
			transparent 70%);
		pointer-events: none;
		border-radius: 8px;
	}

	.nav-label {
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.nav-label.active {
		color: var(--accent-color);
	}

	.user-section {
		margin-top: auto;
		padding-top: 2rem;
		border-top: 1px solid var(--border-color);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		background: var(--hover-bg);
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
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-button {
		background: none;
		border: none;
		padding: 0;
		color: var(--text-secondary);
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
		flex: 1;
		padding-bottom: 2rem;
	}

	.main-content.no-sidebar {
		margin-left: 0;
	}

	.menu-toggle {
		display: none;
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 1000;
		background: rgba(10, 10, 15, 0.8);
		border: none;
		padding: 0.75rem;
		cursor: pointer;
		border-radius: 8px;
		backdrop-filter: blur(8px);
	}

	.hamburger {
		display: block;
		width: 20px;
		height: 2px;
		background: white;
		position: relative;
		transition: all 0.3s ease;
	}

	.hamburger::before,
	.hamburger::after {
		content: '';
		position: absolute;
		width: 20px;
		height: 2px;
		background: white;
		transition: all 0.3s ease;
	}

	.hamburger::before {
		top: -6px;
	}

	.hamburger::after {
		bottom: -6px;
	}

	.sidebar.open .hamburger {
		transform: rotate(45deg);
	}

	.sidebar.open .hamburger::before {
		transform: rotate(90deg);
		top: 0;
	}

	.sidebar.open .hamburger::after {
		transform: rotate(90deg);
		bottom: 0;
	}

	.sidebar-overlay {
		display: none;
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 998;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	.sidebar-overlay.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.search-container {
		padding: 0 1rem 1.5rem 1rem;
	}

	.search-wrapper {
		position: relative;
		width: 100%;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		width: 16px;
		height: 16px;
		opacity: 0.5;
		filter: var(--icon-filter);
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 2.5rem;
		background: var(--input-bg);
		border: 1px solid var(--input-border);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 0.875rem;
		transition: all 0.2s ease;
	}

	.search-input::placeholder {
		color: var(--text-secondary);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent-color);
		box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
	}

	@media (max-width: 768px) {
		.menu-toggle {
			display: block;
		}

		.sidebar-overlay {
			display: block;
		}

		.sidebar {
			position: fixed;
			left: -280px;
			z-index: 999;
			transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			width: 280px;
			padding: 1.25rem;
		}

		.sidebar.open {
			transform: translateX(280px);
			box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
		}

		.content-wrapper {
			margin-left: 0;
		}

		.main-content {
			padding-top: 4.5rem;
		}

		.search-container {
			padding: 1.25rem 0.75rem;
		}

		.search-input {
			font-size: 0.875rem;
			padding: 0.75rem 1rem 0.75rem 2.5rem;
		}

		.nav-menu {
			margin-top: 0.5rem;
		}

		.nav-link {
			padding: 0.875rem;
			justify-content: flex-start;
		}

		.nav-label {
			display: block;
			font-size: 0.875rem;
		}

		.user-info {
			padding: 0.75rem;
		}

		.user-details {
			display: block;
		}

		.username {
			font-size: 0.875rem;
		}

		.user-avatar {
			margin: 0;
		}

		.search-container {
			padding: 1rem 0.5rem;
		}

		.search-input {
			font-size: 0.8125rem;
			padding: 0.625rem 1rem 0.625rem 2.25rem;
		}
	}

	.footer {
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-color);
		padding: 2rem;
		width: 100%;
	}

	.footer-content {
		max-width: 1400px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.5fr 1fr 1fr;
		gap: 4rem;
		padding-bottom: 2rem;
	}

	.footer-section.brand {
		max-width: 300px;
	}

	.footer-logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.footer-emoji {
		font-size: 1.5rem;
	}

	.footer-section h4 {
		color: var(--accent-color);
		font-size: 1.125rem;
		margin: 0 0 1rem;
		font-weight: 600;
		letter-spacing: 0.5px;
	}

	.footer-section p {
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0;
		font-size: 0.9375rem;
	}

	.footer-nav {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.footer-nav a {
		color: var(--text-secondary);
		text-decoration: none;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.9375rem;
	}

	.footer-nav a:hover {
		color: #ff3e00;
		transform: translateX(5px);
	}

	.footer-icon {
		width: 16px;
		height: 16px;
		opacity: var(--menu-icon-opacity);
		filter: var(--icon-filter);
	}

	.footer-nav a[href="/films"] .footer-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(300deg);
	}

	.footer-nav a[href="/tendances"] .footer-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(0deg);
	}

	.footer-nav a[href="/favoris"] .footer-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(330deg);
	}

	.footer-nav a[href="/genres"] .footer-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(100deg);
	}

	.footer-nav a[href="/prochainement"] .footer-icon {
		filter: var(--icon-filter) sepia(100%) saturate(1000%) hue-rotate(180deg);
	}

	.footer-nav a:hover .footer-icon {
		opacity: 1;
		transform: scale(1.1);
	}

	.social-links {
		display: flex;
		gap: 1rem;
	}

	.social-link {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: var(--hover-bg);
		border: 1px solid var(--border-color);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.social-link:hover {
		background: var(--accent-color);
		border-color: var(--accent-color);
		transform: translateY(-3px);
	}

	.social-link img {
		width: 18px;
		height: 18px;
		filter: var(--icon-filter);
		transition: all 0.2s ease;
	}

	.social-link:hover img {
		filter: brightness(0) invert(1);
	}

	.footer-bottom {
		max-width: 1400px;
		margin: 0 auto;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.footer-bottom p {
		margin: 0;
	}

	.tmdb-link {
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.tmdb-link:hover {
		color: #ff3e00;
	}

	@media (max-width: 1024px) {
		.footer-content {
			grid-template-columns: 1fr 1fr;
			gap: 2rem;
		}

		.footer-section.brand {
			grid-column: 1 / -1;
			max-width: none;
		}
	}

	@media (max-width: 768px) {
		.footer {
			padding: 1.5rem;
		}

		.footer-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.footer-bottom {
			flex-direction: column;
			gap: 0.5rem;
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.footer {
			padding: 1rem;
		}

		.footer-content {
			gap: 1.5rem;
		}

		.social-links {
			justify-content: center;
		}
	}

	.theme-toggle {
		width: 100%;
		padding: 0.75rem;
		background: var(--hover-bg);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.theme-toggle:hover {
		background: var(--input-bg);
		border-color: var(--accent-color);
	}

	.title {
		text-align: center;
		font-size: 2.5rem;
		font-weight: bold;
		margin-bottom: 2rem;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.2em;
		position: relative;
		padding-bottom: 1rem;
	}
</style>
