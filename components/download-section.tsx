"use client"

import { useState, useEffect } from "react"
import { Download, Loader2, Film, X, AlertCircle, HardDrive, Plus, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getImageUrl, type Movie } from "@/lib/tmdb"
import { toast } from "sonner"

interface Download {
  id: string
  movie_id: number | null
  movie_title: string
  movie_poster: string | null
  source_name: string
  source_type: 'torrent' | 'streaming' | 'direct'
  quality: string
  url: string
  file_size: string | null
  seeders: number | null
  is_active: boolean
  created_at: string
}

interface DownloadSectionProps {
  movies: Movie[]
  onSearch?: (query: string) => void
}

export function DownloadSection({ movies }: DownloadSectionProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [downloads, setDownloads] = useState<Download[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    movie_title: "",
    source_name: "",
    source_type: "torrent" as const,
    quality: "720p",
    url: "",
    file_size: "",
  })

  const handleMovieClick = async (movie: Movie) => {
    setSelectedMovie(movie)
    setIsLoading(true)
    setDownloads([])
    setShowAddForm(false)

    try {
      const movieTitle = movie.title || movie.name || ""
      const movieId = movie.id
      const res = await fetch(`/api/downloads?movie_id=${movieId}&title=${encodeURIComponent(movieTitle)}`)
      const data = await res.json()
      setDownloads(data.downloads || [])
    } catch (error) {
      console.error("[v0] Download fetch error:", error)
      toast.error("Failed to fetch downloads")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url.trim() || !formData.source_name.trim() || !formData.movie_title.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          movie_id: selectedMovie?.id || null,
          movie_poster: selectedMovie?.poster_path || null,
        }),
      })

      if (!res.ok) throw new Error("Failed to add download")

      const data = await res.json()
      setDownloads([...downloads, data.download])
      setFormData({
        movie_title: "",
        source_name: "",
        source_type: "torrent",
        quality: "720p",
        url: "",
        file_size: "",
      })
      setShowAddForm(false)
      toast.success("Download link added!")
    } catch (error) {
      console.error("[v0] Add download error:", error)
      toast.error("Failed to add download")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/downloads?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setDownloads(downloads.filter(d => d.id !== id))
      toast.success("Download removed")
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Download Movies</h2>
          <p className="text-sm text-muted-foreground">Browse available downloads and streaming links</p>
        </div>
      </div>

      {!selectedMovie ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HardDrive className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Download Section</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Download sources are managed by the admin panel. Contact the administrator to add download links for movies.
          </p>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            View All Downloads
          </Button>
        </div>
      ) : (
        <>
          {/* Back Button */}
          <Button variant="outline" onClick={() => setSelectedMovie(null)} className="gap-2">
            ← Back
          </Button>

          {/* Movie Info */}
          <div className="flex gap-4 items-start bg-secondary/50 p-4 rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(selectedMovie.poster_path) || "/placeholder.svg"}
              alt={selectedMovie.title || ""}
              className="h-24 w-16 rounded-lg object-cover shrink-0"
              crossOrigin="anonymous"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">{selectedMovie.title || selectedMovie.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(selectedMovie.release_date || selectedMovie.first_air_date || "").split("-")[0]}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 gap-1.5"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="h-4 w-4" />
                Add Download Link
              </Button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleAddDownload} className="bg-secondary/50 p-4 rounded-xl border border-border space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Source (e.g. YTS, 1337x)"
                  value={formData.source_name}
                  onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                  required
                />
                <select
                  value={formData.source_type}
                  onChange={(e) => setFormData({ ...formData, source_type: e.target.value as any })}
                  className="rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value="torrent">Torrent</option>
                  <option value="streaming">Streaming</option>
                  <option value="direct">Direct</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Quality (e.g. 1080p)"
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                />
                <Input
                  placeholder="File Size"
                  value={formData.file_size}
                  onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                />
              </div>
              <Input
                placeholder="Download URL/Magnet Link"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
              <Button type="submit" className="w-full">Add Link</Button>
            </form>
          )}

          {/* Downloads List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading downloads...</p>
              </div>
            ) : downloads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
                <p className="font-medium text-foreground">No downloads found</p>
                <p className="text-sm text-muted-foreground">Add one above to get started</p>
              </div>
            ) : (
              downloads.map((download) => (
                <a
                  key={download.id}
                  href={download.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary hover:bg-primary/10 border border-border transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Film className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {download.quality} <span className="text-muted-foreground font-normal">({download.source_name})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {download.source_type} • {download.file_size || "Unknown size"}
                        {download.seeders && ` • ${download.seeders} seeders`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(download.id)
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </a>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
