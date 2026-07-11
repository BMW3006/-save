"use client"

import { Bookmark, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovieCard } from "./movie-card"
import { useWatchlist } from "@/lib/watchlist"
import type { Movie } from "@/lib/tmdb"
import { Empty } from "@/components/ui/empty"

interface WatchlistSectionProps {
  onMovieClick: (movie: Movie) => void
}

export function WatchlistSection({ onMovieClick }: WatchlistSectionProps) {
  const { watchlist, clearWatchlist } = useWatchlist()

  if (watchlist.length === 0) {
    return (
      <div className="py-20">
        <Empty>
          <Empty.Icon>
            <Bookmark className="h-10 w-10" />
          </Empty.Icon>
          <Empty.Title>Your watchlist is empty</Empty.Title>
          <Empty.Description>
            Start adding movies and TV shows to your watchlist by clicking the + button on any title.
          </Empty.Description>
        </Empty>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <Bookmark className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            My Watchlist ({watchlist.length})
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearWatchlist}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {watchlist.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => onMovieClick(movie)}
          />
        ))}
      </div>
    </section>
  )
}
