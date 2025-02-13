const BASE_URL = import.meta.env.VITE_TMDB_API_URL;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

interface MovieResponse {
    page: number;
    results: any[];
    total_pages: number;
    total_results: number;
}

interface Genre {
    id: number;
    name: string;
}

interface GenreResponse {
    genres: Genre[];
}

class ApiService {
    private async fetchWithAuth(endpoint: string, params: Record<string, string | number> = {}) {
        const searchParams = new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR',
            ...params
        });

        const response = await fetch(`${BASE_URL}${endpoint}?${searchParams}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // affiche les films populaires
    async getPopularMovies(page: number = 1): Promise<MovieResponse> {
        return this.fetchWithAuth('/movie/popular', { page });
    }

    // affiche les films tendances
    async getTrendingMovies(page: number = 1): Promise<MovieResponse> {
        return this.fetchWithAuth('/trending/movie/week', { page });
    }

    // affiche les films à venir
    async getUpcomingMovies(page: number = 1): Promise<MovieResponse> {
        return this.fetchWithAuth('/movie/upcoming', { page });
    }

    // affiche les genres
    async getGenres(): Promise<GenreResponse> {
        return this.fetchWithAuth('/genre/movie/list');
    }

    // affiche les films par genre
    async getMoviesByGenre(genreId: number, page: number = 1): Promise<MovieResponse> {
        return this.fetchWithAuth('/discover/movie', { 
            with_genres: genreId,
            page,
            sort_by: 'popularity.desc'
        });
        }

    // affiche les films par titre
    async getMoviesByTitle(title: string, page: number = 1): Promise<MovieResponse> {
        return this.fetchWithAuth('/search/movie', {
            query: title,
            page
        });
    }

    // affiche les films par date
    async getMoviesByDate(date: string, page: number = 1): Promise<MovieResponse> {
        return this.fetchWithAuth('/discover/movie', {
            primary_release_date: date,
            page
        });
    }

    // affiche les films par note
    async getMoviesByNote(note: number, page: number = 1): Promise<MovieResponse> {
        return this.fetchWithAuth('/discover/movie', {
            vote_average: note,
            page
        });
    }

    
}

export const api = new ApiService(); 