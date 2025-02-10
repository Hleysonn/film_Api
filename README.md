# CinéApp

> Une application de films développée avec Svelte pour le cours de SVELTE par Franzy

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=flat&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)

## Aperçu

CinéApp est une application web qui permet de découvrir et gérer vos films préférés. Elle utilise l'API TMDB pour fournir des informations à jour sur les films.

## Captures d'écran

[Insérer des captures d'écran de l'application ici]

## Fonctionnalités

* **Page d'accueil**
  * Splash screen avec animations
  * Navigation intuitive
  * Design moderne

* **Gestion des films**
  * Liste des films populaires
  * Films tendances
  * Films à venir
  * Classement par genres

* **Fonctionnalités utilisateur**
  * Système de favoris
  * Notation des films
  * Authentification

## Code exemple

### Composant Film

```svelte
<script lang="ts">
  export let movie: {
    title: string;
    poster_path: string;
    vote_average: number;
  };
</script>

<div class="movie-card">
  <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title}>
  <h3>{movie.title}</h3>
  <div class="rating">{movie.vote_average}</div>
</div>
```

### Store Favoris

```typescript
import { writable } from 'svelte/store';

export const favoritesStore = writable<Movie[]>([]);
```

## Installation

1. Cloner le projet
```bash
git clone [url]
```

2. Installer les dépendances
```bash
npm install
```

3. Créer un fichier `.env`
```env
VITE_TMDB_API_KEY=votre_clé
```

4. Lancer le projet
```bash
npm run dev
```

## Structure du projet

```
src/
├── lib/
│   ├── components/    # Composants réutilisables
│   └── stores/        # Stores Svelte
├── routes/            # Pages de l'application
└── app.css           # Styles globaux
```

## Technologies

* Svelte + SvelteKit
* TypeScript
* TMDB API
* Vite

## À venir

* Recherche avancée
* Mode hors ligne
* Thème clair/sombre
* Recommandations personnalisées

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amélioration`)
3. Commit vos changements (`git commit -m 'Ajout d'une fonctionnalité'`)
4. Push sur la branche (`git push origin feature/amélioration`)
5. Ouvrir une Pull Request

## Licence

MIT © Franzy

---

Fait avec ❤️ et ☕️
