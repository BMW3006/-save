"use client"

import { ChevronRight } from "lucide-react"
import { MovieCard } from "./movie-card"
import type { Movie } from "@/lib/tmdb"
import { cn } from "@/lib/utils"

interface MovieSectionProps {
  title: string
  icon?: React.ReactNode
  movies: Movie[]
  onMovieClick: (movie: Movie) => void
  className?: string
  isLoading?: boolean
}

export function MovieSection({
  title,
  icon,
  movies,
  onMovieClick,
  className,
  isLoading,
}: MovieSectionProps) {
  if (isLoading) {
    return (
      <section className={cn("space-y-3 sm:space-y-4", className)}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-5 sm:h-6 w-1 bg-primary rounded-full" />
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 sm:overflow-x-auto sm:pb-4 scrollbar-thin">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full sm:w-32 sm:flex-shrink-0 sm:w-32 md:flex-shrink-0 md:w-[160px] lg:flex-shrink-0 lg:w-[180px] space-y-2 sm:space-y-3"
            >
              <div className="aspect-[2/3] rounded-lg sm:rounded-2xl bg-secondary animate-pulse" />
              <div className="h-3 sm:h-4 bg-secondary rounded animate-pulse" />
              <div className="h-2 sm:h-3 w-12 sm:w-16 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (movies.length === 0) {
    return null
  }

  return (
    <section className={cn("space-y-3 sm:space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-5 sm:h-6 w-1 bg-primary rounded-full" />
          {icon && <span className="text-primary text-lg sm:text-xl">{icon}</span>}
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
        </div>
        <button className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
          <span className="hidden sm:inline">See all</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {movies.map((movie) => (
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
