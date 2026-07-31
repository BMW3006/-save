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
      className="group relative cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary shadow-lg group-hover:shadow-2xl transition-shadow duration-300 flex-shrink-0">
        {movie.poster_path ? (
          <img
            src={`${IMG_URL}${movie.poster_path}`}
            alt={movie.title || movie.name || "Movie poster"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* TV Badge */}
        {movie.media_type === "tv" && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary/95 text-primary-foreground text-xs font-semibold flex items-center gap-1 shadow-md">
            <Tv className="h-3 w-3" />
            <span>TV</span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-yellow-400/90 backdrop-blur-sm text-xs font-bold flex items-center gap-0.5 shadow-md">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {movie.vote_average?.toFixed(1)}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
            onClick={onClick}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full bg-background/90 backdrop-blur-md border-2",
              inWatchlist && "bg-primary text-primary-foreground border-primary"
            )}
            onClick={handleWatchlistToggle}
          >
            {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-0.5 flex-grow flex flex-col">
        <h3 className="font-semibold text-xs line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-tight">
          {movie.title || movie.name}
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          {(movie.release_date || movie.first_air_date)?.slice(0, 4) || "TBA"}
        </p>
      </div>
    </div>
  )
}
