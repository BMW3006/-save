'use client'

import { useEffect, useState } from 'react'
import { Star, Clock, Calendar, Play, Plus, Check, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { MovieDetails, Cast, Video } from '@/lib/tmdb'
import { getMovieCredits, getMovieVideos, IMG_URL, BACKDROP_URL } from '@/lib/tmdb'
import { useWatchlist } from '@/lib/watchlist'
import { ShareButton } from './share-button'
import { generateMovieShareUrl } from '@/lib/share'
import { toast } from 'sonner'

interface MovieShareViewProps {
  movie: MovieDetails
  movieId: number
}

export function MovieShareView({ movie, movieId }: MovieShareViewProps) {
  const [cast, setCast] = useState<Cast[]>([])
  const [director, setDirector] = useState<string>('')
  const [trailer, setTrailer] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  const inWatchlist = isInWatchlist(movieId)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [creditsData, videosData] = await Promise.all([
          getMovieCredits(movieId, 'movie'),
          getMovieVideos(movieId, 'movie'),
        ])

        setCast(creditsData.cast.slice(0, 8))
        setDirector(creditsData.crew.find((c) => c.job === 'Director')?.name || '')
        setTrailer(videosData.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || null)
      } catch (error) {
        console.error('Failed to fetch movie details:', error)
        toast.error('Failed to load movie details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [movieId])

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(movieId)
      toast.info('Removed from watchlist')
    } else {
      addToWatchlist({
        id: movieId,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        release_date: movie.release_date,
        media_type: 'movie',
      } as any)
      toast.success('Added to watchlist!')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] w-full">
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
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Poster & Title */}
        <div className="grid md:grid-cols-4 gap-6 mb-8 -mt-24 relative z-10">
          <div className="md:col-span-1">
            {movie.poster_path ? (
              <img
                src={`${IMG_URL}${movie.poster_path}`}
                alt={movie.title}
                className="w-full rounded-xl shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-xl flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
          </div>

          <div className="md:col-span-3 space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {movie.title}
              </h1>
              <p className="text-muted-foreground">{movie.tagline}</p>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-accent font-semibold">
                <Star className="h-4 w-4 fill-accent" />
                {movie.vote_average?.toFixed(1)}/10
              </span>
              {movie.runtime && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {movie.runtime} min
                </span>
              )}
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {movie.release_date?.slice(0, 4)}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <Badge key={genre.id} variant="secondary" className="rounded-full">
                  {genre.name}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
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
                variant={inWatchlist ? 'secondary' : 'outline'}
                className="gap-2 rounded-full"
                onClick={handleWatchlistToggle}
              >
                {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
              <ShareButton
                title={movie.title}
                description={movie.overview}
                url={generateMovieShareUrl(movieId, movie.title)}
                type="movie"
                showFeedback
              />
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              {movie.overview || 'No overview available.'}
            </p>
          </div>

          {/* Director */}
          {director && (
            <div>
              <h3 className="font-semibold text-foreground mb-1">Director</h3>
              <p className="text-muted-foreground">{director}</p>
            </div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Cast</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cast.map((person) => (
                  <div key={person.id} className="text-center">
                    {person.profile_path ? (
                      <img
                        src={`${IMG_URL}${person.profile_path}`}
                        alt={person.name}
                        className="w-full aspect-square rounded-lg object-cover mb-2"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-secondary flex items-center justify-center mb-2">
                        <span className="text-muted-foreground text-sm">{person.name.charAt(0)}</span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
