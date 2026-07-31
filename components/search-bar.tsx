"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Movie } from "@/lib/tmdb"

interface SearchBarProps {
  onSearch: (query: string) => void
  onMovieSelect?: (movie: Movie) => void
  className?: string
  showAutocomplete?: boolean
}

export function SearchBar({ 
  onSearch, 
  onMovieSelect,
  className,
  showAutocomplete = true 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch suggestions as user types
  useEffect(() => {
    if (!showAutocomplete || !searchQuery.trim()) {
      setSuggestions([])
      setHighlightedIndex(-1)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=multi`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.results.slice(0, 8))
          setHighlightedIndex(-1)
        }
      } catch (error) {
        console.error("[v0] Autocomplete error:", error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, showAutocomplete])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectSuggestion(suggestions[highlightedIndex])
        } else if (searchQuery.trim()) {
          handleSearch()
        }
      } else if (e.key === "Escape") {
        setSuggestions([])
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, highlightedIndex, suggestions, searchQuery])

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestions([])
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
      setSuggestions([])
      setIsOpen(false)
    }
  }

  const handleSelectSuggestion = (movie: Movie) => {
    setSearchQuery(movie.title || movie.name || "")
    if (onMovieSelect) {
      onMovieSelect(movie)
    } else {
      onSearch(movie.title || movie.name || "")
    }
    setSuggestions([])
    setIsOpen(false)
  }

  const handleClear = () => {
    setSearchQuery("")
    setSuggestions([])
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const IMG_URL = "https://image.tmdb.org/t/p/w200"

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
        className="relative w-full"
      >
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search movies, TV shows..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => {
              if (searchQuery.trim()) {
                setIsOpen(true)
              }
            }}
            className="pl-10 pr-10 bg-secondary border-border rounded-full text-sm h-10"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <div className="py-1">
              {suggestions.map((movie, index) => (
                <button
                  key={movie.id}
                  onClick={() => handleSelectSuggestion(movie)}
                  className={cn(
                    "w-full px-3 py-2 flex items-center gap-3 text-left transition-colors hover:bg-secondary",
                    highlightedIndex === index && "bg-secondary"
                  )}
                >
                  {/* Poster thumbnail */}
                  {movie.poster_path ? (
                    <img
                      src={`${IMG_URL}${movie.poster_path}`}
                      alt={movie.title || movie.name}
                      className="w-8 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                      No
                    </div>
                  )}

                  {/* Movie info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {movie.title || movie.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {movie.media_type === "tv" ? "TV Show" : "Movie"} •{" "}
                      {(movie.release_date || movie.first_air_date)?.split("-")[0] || "TBA"}
                    </div>
                  </div>

                  {/* Rating */}
                  {movie.vote_average && (
                    <div className="text-xs font-semibold text-yellow-400">
                      ★ {movie.vote_average?.toFixed(1)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {isOpen && isLoading === false && suggestions.length === 0 && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
          No results found for "{searchQuery}"
        </div>
      )}
    </div>
  )
}
