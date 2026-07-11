const API_KEY = "bc96f3d21bf9384fe03ffe84bace0ac1"
const BASE_URL = "https://api.themoviedb.org/3"

export const IMG_URL = "https://image.tmdb.org/t/p/w500"
export const BACKDROP_URL = "https://image.tmdb.org/t/p/original"

export function getImageUrl(path: string | null, size: "w500" | "original" = "w500"): string {
  if (!path) return "/placeholder.svg"
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export interface Movie {
  id: number
  title: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  vote_average: number
  vote_count: number
  release_date?: string
  first_air_date?: string
  genre_ids: number[]
  media_type?: string
}

export interface MovieDetails extends Movie {
  runtime: number
  genres: { id: number; name: string }[]
  tagline: string
  budget: number
  revenue: number
  status: string
  production_companies: { id: number; name: string; logo_path: string | null }[]
}

export interface Cast {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
}

export interface Genre {
  id: number
  name: string
}

export const GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
]

export const TV_GENRES: Genre[] = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
]

async function fetchTMDB<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${API_KEY}`)
  if (!res.ok) throw new Error("Failed to fetch from TMDB")
  return res.json()
}

export async function getPopularMovies(): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>("/movie/popular?language=en-US")
  return data.results
}

export async function getTopRatedMovies(): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>("/movie/top_rated?language=en-US")
  return data.results
}

export async function getUpcomingMovies(): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>("/movie/upcoming?language=en-US")
  return data.results
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>("/movie/now_playing?language=en-US")
  return data.results
}

export async function getMoviesByGenre(genreId: number): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/discover/movie?with_genres=${genreId}&language=en-US`)
  return data.results
}

export async function getTVShows(): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>("/tv/popular?language=en-US")
  return data.results.map((show) => ({ ...show, title: show.name || "", media_type: "tv" }))
}

export async function getTopRatedTV(): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>("/tv/top_rated?language=en-US")
  return data.results.map((show) => ({ ...show, title: show.name || "", media_type: "tv" }))
}

export async function getTVByGenre(genreId: number): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/discover/tv?with_genres=${genreId}&language=en-US`)
  return data.results.map((show) => ({ ...show, title: show.name || "", media_type: "tv" }))
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/search/multi?query=${encodeURIComponent(query)}&language=en-US`)
  return data.results.filter((item) => item.media_type === "movie" || item.media_type === "tv")
}

export async function getMovieDetails(id: number, mediaType: "movie" | "tv" = "movie"): Promise<MovieDetails> {
  const data = await fetchTMDB<MovieDetails>(`/${mediaType}/${id}?language=en-US`)
  return data
}

export async function getMovieCredits(id: number, mediaType: "movie" | "tv" = "movie"): Promise<{ cast: Cast[]; crew: { job: string; name: string }[] }> {
  const data = await fetchTMDB<{ cast: Cast[]; crew: { job: string; name: string }[] }>(`/${mediaType}/${id}/credits`)
  return data
}

export async function getMovieVideos(id: number, mediaType: "movie" | "tv" = "movie"): Promise<Video[]> {
  const data = await fetchTMDB<{ results: Video[] }>(`/${mediaType}/${id}/videos`)
  return data.results
}

export async function getSimilarMovies(id: number, mediaType: "movie" | "tv" = "movie"): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/${mediaType}/${id}/similar?language=en-US`)
  return data.results
}

export async function getTrendingAll(): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>("/trending/all/week?language=en-US")
  return data.results
}
