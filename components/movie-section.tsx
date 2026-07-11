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
      <section className={cn("space-y-4", className)}>
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[160px] md:w-[180px] space-y-3"
            >
              <div className="aspect-[2/3] rounded-2xl bg-secondary animate-pulse" />
              <div className="h-4 bg-secondary rounded animate-pulse" />
              <div className="h-3 w-16 bg-secondary rounded animate-pulse" />
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
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-primary rounded-full" />
          {icon && <span className="text-primary">{icon}</span>}
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          See all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scroll-smooth">
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
