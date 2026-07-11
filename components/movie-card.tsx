"use client"

import { Star, Plus, Check, Play, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Movie } from "@/lib/tmdb"
import { IMG_URL } from "@/lib/tmdb"
import { useWatchlist } from "@/lib/watchlist"
import { cn } from "@/lib/utils"

interface MovieCardProps {
  movie: Movie
  onClick: () => void
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const inWatchlist = isInWatchlist(movie.id)

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inWatchlist) {
      removeFromWatchlist(movie.id)
    } else {
      addToWatchlist(movie)
    }
  }

  return (
    <div
      className="group relative flex-shrink-0 w-[160px] md:w-[180px] cursor-pointer"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-secondary">
        {movie.poster_path ? (
          <img
            src={`${IMG_URL}${movie.poster_path}`}
            alt={movie.title || movie.name || "Movie poster"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* TV Badge */}
        {movie.media_type === "tv" && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1">
            <Tv className="h-3 w-3" />
            TV
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-semibold flex items-center gap-1">
          <Star className="h-3 w-3 fill-accent text-accent" />
          {movie.vote_average?.toFixed(1)}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={onClick}
          >
            <Play className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm",
              inWatchlist && "bg-primary text-primary-foreground border-primary"
            )}
            onClick={handleWatchlistToggle}
          >
            {inWatchlist ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors">
          {movie.title || movie.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {(movie.release_date || movie.first_air_date)?.slice(0, 4) || "TBA"}
        </p>
      </div>
    </div>
  )
}
