"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { GENRES, TV_GENRES, type Genre } from "@/lib/tmdb"
import { cn } from "@/lib/utils"

interface GenreFilterProps {
  selectedGenre: number | null
  onGenreChange: (genreId: number | null) => void
  isTV?: boolean
}

export function GenreFilter({ selectedGenre, onGenreChange, isTV = false }: GenreFilterProps) {
  const genres = isTV ? TV_GENRES : GENRES

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Filter by Genre</h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Button
            variant={selectedGenre === null ? "default" : "outline"}
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => onGenreChange(null)}
          >
            All
          </Button>
          {genres.map((genre) => (
            <Button
              key={genre.id}
              variant={selectedGenre === genre.id ? "default" : "outline"}
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => onGenreChange(genre.id)}
            >
              {genre.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
