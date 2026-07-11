"use client"

import { useState, useEffect, useCallback } from "react"
import { Flame, Star, Calendar, Tv, Film, TrendingUp, Sparkles, Music } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { Slideshow } from "@/components/slideshow"
import { MovieSection } from "@/components/movie-section"
import { GenreFilter } from "@/components/genre-filter"
import { MovieModal } from "@/components/movie-modal"
import { WatchlistSection } from "@/components/watchlist-section"
import { MusicSection } from "@/components/music-section"
import { SongRecognition } from "@/components/song-recognition"
import { LiveTVSection } from "@/components/live-tv-section"
import { DownloadSection } from "@/components/download-section"
import { trendingSongs } from "@/lib/audd"
import {
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  getTVShows,
  getTopRatedTV,
  getMoviesByGenre,
  getTVByGenre,
  searchMovies,
  getTrendingAll,
  type Movie,
} from "@/lib/tmdb"

type Category = "trending" | "top_rated" | "upcoming" | "tv" | "watchlist" | "music" | "livetv" | "download"

export default function HomePage() {
  const [isDark, setIsDark] = useState(true)
  const [category, setCategory] = useState<Category>("trending")
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Movie data
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([])
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([])
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([])
  const [tvShows, setTvShows] = useState<Movie[]>([])
  const [topRatedTV, setTopRatedTV] = useState<Movie[]>([])
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [genreMovies, setGenreMovies] = useState<Movie[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)

  // Modal state
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newValue = !prev
      document.documentElement.classList.toggle("light", newValue === false)
      return newValue
    })
  }, [])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [trending, topRated, upcoming, nowPlaying, tv, tvTop] = await Promise.all([
          getTrendingAll(),
          getTopRatedMovies(),
          getUpcomingMovies(),
          getNowPlayingMovies(),
          getTVShows(),
          getTopRatedTV(),
        ])
        setTrendingMovies(trending)
        setTopRatedMovies(topRated)
        setUpcomingMovies(upcoming)
        setNowPlayingMovies(nowPlaying)
        setTvShows(tv)
        setTopRatedTV(tvTop)
      } catch (error) {
        console.error("Failed to fetch movies:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Handle genre filter
  useEffect(() => {
    if (selectedGenre === null) {
      setGenreMovies([])
      return
    }

    const fetchGenreMovies = async () => {
      try {
        if (category === "tv") {
          const movies = await getTVByGenre(selectedGenre)
          setGenreMovies(movies.map((m) => ({ ...m, media_type: "tv" })))
        } else {
          const movies = await getMoviesByGenre(selectedGenre)
          setGenreMovies(movies)
        }
      } catch (error) {
        console.error("Failed to fetch genre movies:", error)
      }
    }
    fetchGenreMovies()
  }, [selectedGenre, category])

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const results = await searchMovies(query)
      setSearchResults(results)
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory as Category)
    setSelectedGenre(null)
    setSearchQuery("")
    setSearchResults([])
  }

  // Handle movie click
  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  // Get movies for slideshow based on category
  const getSlideshowMovies = () => {
    if (searchResults.length > 0) return searchResults
    switch (category) {
      case "top_rated":
        return topRatedMovies
      case "upcoming":
        return upcomingMovies
      case "tv":
        return tvShows
      default:
        return trendingMovies
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Screen */}
      {showLoadingScreen && (
        <LoadingScreen onComplete={() => setShowLoadingScreen(false)} />
      )}

      <Navbar
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        currentCategory={category}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {/* Banner */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">BMW Community</span>
              <span className="text-sm opacity-90">Entertainment Hub</span>
            </div>
            <span className="text-sm opacity-80">Movies, Music, Live TV & AI</span>
          </div>

          {/* Watchlist View */}
          {category === "watchlist" ? (
            <WatchlistSection onMovieClick={handleMovieClick} />
          ) : category === "livetv" ? (
            <LiveTVSection />
          ) : category === "download" ? (
            <DownloadSection
              movies={searchResults.length > 0 ? searchResults : trendingMovies}
              onSearch={handleSearch}
            />
          ) : category === "music" ? (
            <div className="space-y-8">
              {/* Song Recognition */}
              <SongRecognition />

              {/* Trending Songs */}
              <MusicSection songs={trendingSongs} title="Trending Songs" />
            </div>
          ) : (
            <>
              {/* Search Results */}
              {searchResults.length > 0 ? (
                <div className="space-y-8">
                  <Slideshow movies={searchResults} onMovieClick={handleMovieClick} />
                  <MovieSection
                    title={`Search Results for "${searchQuery}"`}
                    movies={searchResults}
                    onMovieClick={handleMovieClick}
                  />
                </div>
              ) : (
                <>
                  {/* Slideshow */}
                  <Slideshow
                    movies={getSlideshowMovies()}
                    onMovieClick={handleMovieClick}
                  />

                  {/* Genre Filter */}
                  <GenreFilter
                    selectedGenre={selectedGenre}
                    onGenreChange={setSelectedGenre}
                    isTV={category === "tv"}
                  />

                  {/* Genre Results */}
                  {selectedGenre !== null && genreMovies.length > 0 && (
                    <MovieSection
                      title="Filtered Results"
                      icon={<Film className="h-5 w-5" />}
                      movies={genreMovies}
                      onMovieClick={handleMovieClick}
                    />
                  )}

                  {/* Category Content */}
                  {selectedGenre === null && (
                    <>
                      {category === "trending" && (
                        <>
                          <MovieSection
                            title="Trending Now"
                            icon={<Flame className="h-5 w-5" />}
                            movies={trendingMovies.slice(0, 12)}
                            onMovieClick={handleMovieClick}
                            isLoading={isLoading}
                          />
                          <MovieSection
                            title="Now Playing"
                            icon={<TrendingUp className="h-5 w-5" />}
                            movies={nowPlayingMovies.slice(0, 12)}
                            onMovieClick={handleMovieClick}
                            isLoading={isLoading}
                          />
                          <MovieSection
                            title="Top Rated"
                            icon={<Star className="h-5 w-5" />}
                            movies={topRatedMovies.slice(0, 12)}
                            onMovieClick={handleMovieClick}
                            isLoading={isLoading}
                          />
                          <MovieSection
                            title="Upcoming"
                            icon={<Calendar className="h-5 w-5" />}
                            movies={upcomingMovies.slice(0, 12)}
                            onMovieClick={handleMovieClick}
                            isLoading={isLoading}
                          />
                        </>
                      )}

                      {category === "top_rated" && (
                        <MovieSection
                          title="Top Rated Movies"
                          icon={<Star className="h-5 w-5" />}
                          movies={topRatedMovies}
                          onMovieClick={handleMovieClick}
                          isLoading={isLoading}
                        />
                      )}

                      {category === "upcoming" && (
                        <MovieSection
                          title="Upcoming Movies"
                          icon={<Calendar className="h-5 w-5" />}
                          movies={upcomingMovies}
                          onMovieClick={handleMovieClick}
                          isLoading={isLoading}
                        />
                      )}

                      {category === "tv" && (
                        <>
                          <MovieSection
                            title="Popular TV Shows"
                            icon={<Tv className="h-5 w-5" />}
                            movies={tvShows.slice(0, 12)}
                            onMovieClick={handleMovieClick}
                            isLoading={isLoading}
                          />
                          <MovieSection
                            title="Top Rated TV Shows"
                            icon={<Star className="h-5 w-5" />}
                            movies={topRatedTV.slice(0, 12)}
                            onMovieClick={handleMovieClick}
                            isLoading={isLoading}
                          />
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="text-primary font-semibold">RX</span> | Mzamini: <span className="text-primary font-semibold">KAVAVILA</span>
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BMW Community | All rights reserved | Entertainment Hub
          </p>
        </div>
      </footer>

      {/* Movie Details Modal */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMovieClick={(movie) => {
          setSelectedMovie(movie)
        }}
      />
    </div>
  )
}
