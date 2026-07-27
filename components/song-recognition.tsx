"use client"

import { useState } from "react"
import { Search, Loader2, Music2, FileDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMusic } from "@/context/music-context"

interface AzbryTrack {
  id: string
  title: string
  artist: string
  duration: number
  coverImage: string
  source: string
  url: string
  videoId?: string
  youtubeUrl?: string
  downloadFormats: Array<{
    format: string
    url: string
    type?: 'audio' | 'video'
  }>
}

interface SongRecognitionProps {
  onSongFound?: (song: AzbryTrack) => void
}

export function SongRecognition({ onSongFound }: SongRecognitionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [foundSong, setFoundSong] = useState<AzbryTrack | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const { setCurrentTrack, isPlaying, togglePlayPause } = useMusic()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/music/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery.trim() }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setFoundSong(data.data)
        setShowModal(true)
        setSelectedFormat(null)
        onSongFound?.(data.data)
      } else {
        setError(data.message || "Song not found. Please try another search.")
      }
    } catch {
      setError("Failed to search for song. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSearch()
    }
  }

  const handlePlayClick = () => {
    if (!foundSong) return
    setCurrentTrack({
      id: foundSong.id,
      title: foundSong.title,
      artist: foundSong.artist,
      duration: foundSong.duration,
      coverImage: foundSong.coverImage,
      url: foundSong.url,
      videoId: foundSong.videoId,
      youtubeUrl: foundSong.youtubeUrl,
      downloadFormats: foundSong.downloadFormats,
    })
    togglePlayPause()
  }

  const handleDownload = (format: AzbryTrack['downloadFormats'][0]) => {
    if (format.url) {
      window.open(format.url, '_blank')
    }
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Music2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Search Music</h3>
            <p className="text-sm text-muted-foreground">Find songs using Azbry Music API</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Search for a song, artist, or album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-secondary/50"
          />
          <Button 
            onClick={handleSearch} 
            disabled={!searchQuery.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Loading Animation */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </Card>

      {/* Result Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-primary" />
              Song Found!
            </DialogTitle>
          </DialogHeader>

          {foundSong && (
            <div className="space-y-4">
              {/* Album Art */}
              <div className="flex items-start gap-4">
                <img
                  src={foundSong.coverImage}
                  alt={foundSong.title}
                  className="w-24 h-24 rounded-lg object-cover shadow-lg"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-lg">{foundSong.title}</h4>
                  <p className="text-muted-foreground">{foundSong.artist}</p>
                  <p className="text-sm text-muted-foreground">{Math.floor(foundSong.duration / 60)}:{String(foundSong.duration % 60).padStart(2, "0")}</p>
                </div>
              </div>

              {/* Play Button */}
              {foundSong.url && (
                <Button
                  onClick={handlePlayClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isPlaying && foundSong.id === foundSong.id ? (
                    <>
                      ⏸ Stop Playing
                    </>
                  ) : (
                    <>
                      ▶ Play Music
                    </>
                  )}
                </Button>
              )}

              {/* Download Format Selection */}
              {foundSong.downloadFormats.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Download Format:</p>
                  <div className="flex flex-col gap-2">
                    {foundSong.downloadFormats.map((format, index) => (
                      <Button
                        key={index}
                        onClick={() => handleDownload(format)}
                        variant="outline"
                        className="w-full justify-center gap-2 hover:bg-primary/10"
                      >
                        <FileDown className="h-4 w-4" />
                        <span>{format.format}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowModal(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
