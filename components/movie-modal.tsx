"use client"

import { useEffect, useState } from "react"
import { X, Star, Clock, Calendar, Play, Plus, Check, Users } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { Movie, MovieDetails, Cast, Video } from "@/lib/tmdb"
import { getMovieDetails, getMovieCredits, getMovieVideos, getSimilarMovies, IMG_URL, BACKDROP_URL } from "@/lib/tmdb"
import { useWatchlist } from "@/lib/watchlist"
import { generateMovieShareUrl } from "@/lib/share"
import { MovieCard } from "./movie-card"
import { ShareButton } from "./share-button"
import { toast } from "sonner"

interface MovieModalProps {
  movie: Movie | null
  isOpen: boolean
  onClose: () => void
  onMovieClick: (movie: Movie) => void
}

export function MovieModal({ movie, isOpen, onClose, onMovieClick }: MovieModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [cast, setCast] = useState<Cast[]>([])
  const [director, setDirector] = useState<string>("")
  const [trailer, setTrailer] = useState<Video | null>(null)
  const [similar, setSimilar] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  const mediaType = movie?.media_type === "tv" ? "tv" : "movie"
  const inWatchlist = movie ? isInWatchlist(movie.id) : false

  useEffect(() => {
    if (!movie || !isOpen) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [detailsData, creditsData, videosData, similarData] = await Promise.all([
          getMovieDetails(movie.id, mediaType),
          getMovieCredits(movie.id, mediaType),
          getMovieVideos(movie.id, mediaType),
          getSimilarMovies(movie.id, mediaType),
        ])

        setDetails(detailsData)
        setCast(creditsData.cast.slice(0, 8))
        setDirector(creditsData.crew.find((c) => c.job === "Director")?.name || "")
        setTrailer(videosData.find((v) => v.type === "Trailer" && v.site === "YouTube") || null)
        setSimilar(similarData.slice(0, 10))
      } catch (error) {
        console.error("Failed to fetch movie details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [movie, isOpen, mediaType])



  const handleWatchlistToggle = () => {
    if (!movie) return
    if (inWatchlist) {
      removeFromWatchlist(movie.id)
      toast.info("Removed from watchlist")
    } else {
      addToWatchlist(movie)
      toast.success("Added to watchlist!")
    }
  }

  if (!movie) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border max-h-[90vh]">
        <DialogTitle className="sr-only">{movie.title || movie.name}</DialogTitle>
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Section */}
          <div className="relative h-[300px] md:h-[400px]">
            {movie.backdrop_path ? (
              <img
                src={`${BACKDROP_URL}${movie.backdrop_path}`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Poster & Title */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-6">
              <div className="hidden md:block shrink-0 w-32 rounded-xl overflow-hidden shadow-2xl -mb-16 relative z-10">
                {movie.poster_path ? (
                  <img
                    src={`${IMG_URL}${movie.poster_path}`}
                    alt=""
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {movie.title || movie.name}
                </h1>
                {isLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-accent font-semibold">
                      <Star className="h-4 w-4 fill-accent" />
                      {details?.vote_average?.toFixed(1)}/10
                    </span>
                    {details?.runtime && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {details.runtime} min
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {(movie.release_date || movie.first_air_date)?.slice(0, 4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 md:ml-[160px]">
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {trailer && (
                <Button asChild className="gap-2 rounded-full">
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-4 w-4" />
                    Watch Trailer
                  </a>
                </Button>
              )}
              <Button
                variant={inWatchlist ? "secondary" : "outline"}
                className="gap-2 rounded-full"
                onClick={handleWatchlistToggle}
              >
                {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </Button>
              <ShareButton
                title={movie.title || movie.name || "Movie"}
                description={details?.overview || movie.overview}
                url={generateMovieShareUrl(movie.id, movie.title || movie.name || "Movie")}
                type="movie"
                showFeedback
              />
            </div>

            {/* Genres */}
            {isLoading ? (
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            ) : (
              details?.genres && (
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((genre) => (
                    <Badge key={genre.id} variant="secondary" className="rounded-full">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )
            )}

            {/* Overview */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Overview</h3>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {details?.overview || movie.overview || "No overview available."}
                </p>
              )}
            </div>

            {/* Director */}
            {director && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Director</h3>
                <p className="text-muted-foreground">{director}</p>
              </div>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Cast</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cast.map((person) => (
                    <div key={person.id} className="flex items-center gap-3">
                      <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-secondary">
                        {person.profile_path ? (
                          <img
                            src={`${IMG_URL}${person.profile_path}`}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            {person.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Movies */}
            {similar.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">You might also like</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {similar.map((m) => (
                    <MovieCard
                      key={m.id}
                      movie={{ ...m, media_type: mediaType }}
                      onClick={() => onMovieClick({ ...m, media_type: mediaType })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
