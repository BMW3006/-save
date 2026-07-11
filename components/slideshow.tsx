"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Play, Star, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Movie } from "@/lib/tmdb"
import { BACKDROP_URL } from "@/lib/tmdb"
import { useWatchlist } from "@/lib/watchlist"
import { cn } from "@/lib/utils"

interface SlideshowProps {
  movies: Movie[]
  onMovieClick: (movie: Movie) => void
}

export function Slideshow({ movies, onMovieClick }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  const slides = movies.slice(0, 5)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length, nextSlide])

  if (slides.length === 0) {
    return (
      <div className="h-[400px] md:h-[500px] bg-secondary rounded-3xl flex items-center justify-center">
        <p className="text-muted-foreground">Loading slideshow...</p>
      </div>
    )
  }

  const currentMovie = slides[currentIndex]
  const inWatchlist = isInWatchlist(currentMovie.id)

  return (
    <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden group">
      {/* Slides */}
      {slides.map((movie, idx) => (
        <div
          key={movie.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: movie.backdrop_path
                ? `url(${BACKDROP_URL}${movie.backdrop_path})`
                : "none",
              backgroundColor: movie.backdrop_path ? undefined : "var(--secondary)",
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-10">
        <div className="max-w-xl space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-tight text-balance">
            {currentMovie.title || currentMovie.name}
          </h2>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-accent font-semibold">
              <Star className="h-4 w-4 fill-accent" />
              {currentMovie.vote_average?.toFixed(1)}/10
            </span>
            <span className="text-muted-foreground">
              {(currentMovie.release_date || currentMovie.first_air_date)?.slice(0, 4)}
            </span>
          </div>

          <p className="text-muted-foreground text-sm md:text-base line-clamp-2 md:line-clamp-3">
            {currentMovie.overview}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => onMovieClick(currentMovie)}
              className="gap-2 rounded-full"
            >
              <Play className="h-4 w-4" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() =>
                inWatchlist
                  ? removeFromWatchlist(currentMovie.id)
                  : addToWatchlist(currentMovie)
              }
            >
              {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              idx === currentIndex
                ? "w-8 bg-primary"
                : "w-2 bg-foreground/30 hover:bg-foreground/50"
            )}
          />
        ))}
      </div>
    </div>
  )
}
