"use client"

import { useState, useRef, useEffect } from "react"
import { Music, Play, Pause, ExternalLink, Heart, SkipBack, SkipForward, Volume2, VolumeX, Disc3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { type Song, getAlbumArt, getPreviewUrl, getStreamingLink } from "@/lib/audd"
import { cn } from "@/lib/utils"

interface MusicSectionProps {
  songs: Song[]
  title?: string
}

export function MusicSection({ songs, title = "Trending Songs" }: MusicSectionProps) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("music_favorites")
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)))
    }
  }, [])

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handlePlaySong = (song: Song) => {
    const previewUrl = getPreviewUrl(song)
    
    if (currentSong?.title === song.title && currentSong?.artist === song.artist) {
      // Toggle play/pause for current song
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play()
        setIsPlaying(true)
      }
    } else {
      // Play new song
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      setCurrentSong(song)
      setIsPlaying(true)
      setProgress(0)
      
      if (previewUrl) {
        // Create new audio element
        const audio = new Audio(previewUrl)
        audio.volume = isMuted ? 0 : volume
        audioRef.current = audio
        
        audio.addEventListener("timeupdate", () => {
          setProgress(audio.currentTime)
          setDuration(audio.duration || 30)
        })
        
        audio.addEventListener("ended", () => {
          setIsPlaying(false)
          setProgress(0)
        })
        
        audio.play().catch(() => {
          setIsPlaying(false)
        })
      }
    }
  }

  const handleToggleFavorite = (song: Song) => {
    const key = `${song.artist}-${song.title}`
    const newFavorites = new Set(favorites)
    
    if (newFavorites.has(key)) {
      newFavorites.delete(key)
    } else {
      newFavorites.add(key)
    }
    
    setFavorites(newFavorites)
    localStorage.setItem("music_favorites", JSON.stringify([...newFavorites]))
  }

  const handleSkipPrevious = () => {
    if (!currentSong) return
    const currentIndex = songs.findIndex(s => s.title === currentSong.title && s.artist === currentSong.artist)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1
    handlePlaySong(songs[prevIndex])
  }

  const handleSkipNext = () => {
    if (!currentSong) return
    const currentIndex = songs.findIndex(s => s.title === currentSong.title && s.artist === currentSong.artist)
    const nextIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : 0
    handlePlaySong(songs[nextIndex])
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20">
          <Music className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
      </div>

      {/* Now Playing Bar */}
      {currentSong && (
        <Card className="bg-gradient-to-r from-primary/10 via-card to-primary/5 border-primary/20 p-4">
          <div className="flex items-center gap-4">
            {/* Album Art */}
            <div className="relative group">
              <img
                src={getAlbumArt(currentSong)}
                alt={currentSong.album}
                className="w-16 h-16 rounded-lg object-cover shadow-lg"
              />
              <div className={cn(
                "absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg",
                isPlaying && "animate-pulse"
              )}>
                <Disc3 className={cn("h-8 w-8 text-primary", isPlaying && "animate-spin")} style={{ animationDuration: "3s" }} />
              </div>
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{currentSong.title}</p>
              <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground w-10">{formatTime(progress)}</span>
                <Slider
                  value={[progress]}
                  max={duration || 30}
                  step={0.1}
                  className="flex-1"
                  onValueChange={(value) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = value[0]
                      setProgress(value[0])
                    }
                  }}
                />
                <span className="text-xs text-muted-foreground w-10">{formatTime(duration || 30)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleSkipPrevious}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                className="bg-primary hover:bg-primary/90"
                onClick={() => handlePlaySong(currentSong)}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSkipNext}>
                <SkipForward className="h-4 w-4" />
              </Button>
              
              {/* Volume */}
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  className="w-20"
                  onValueChange={(value) => {
                    setVolume(value[0] / 100)
                    setIsMuted(false)
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Songs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {songs.map((song, index) => {
          const isCurrentSong = currentSong?.title === song.title && currentSong?.artist === song.artist
          const isFavorite = favorites.has(`${song.artist}-${song.title}`)
          const spotifyLink = getStreamingLink(song, "spotify")
          
          return (
            <Card
              key={`${song.artist}-${song.title}-${index}`}
              className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer",
                "bg-card border-border hover:border-primary/50",
                isCurrentSong && "ring-2 ring-primary border-primary"
              )}
            >
              {/* Album Art */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={getAlbumArt(song)}
                  alt={song.album}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Play Button */}
                <Button
                  size="icon"
                  className={cn(
                    "absolute bottom-2 right-2 shadow-lg transition-all duration-300",
                    "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
                    "bg-primary hover:bg-primary/90",
                    isCurrentSong && isPlaying && "opacity-100 translate-y-0"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlaySong(song)
                  }}
                >
                  {isCurrentSong && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>

                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute top-2 right-2 transition-all duration-300",
                    "opacity-0 group-hover:opacity-100",
                    isFavorite && "opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleFavorite(song)
                  }}
                >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
                </Button>

                {/* Now Playing Indicator */}
                {isCurrentSong && isPlaying && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs">
                    <span className="flex gap-0.5">
                      <span className="w-0.5 h-3 bg-primary-foreground rounded animate-pulse" style={{ animationDelay: "0ms" }} />
                      <span className="w-0.5 h-3 bg-primary-foreground rounded animate-pulse" style={{ animationDelay: "150ms" }} />
                      <span className="w-0.5 h-3 bg-primary-foreground rounded animate-pulse" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                )}
              </div>

              {/* Song Info */}
              <div className="p-3 space-y-1">
                <h3 className="font-medium text-sm text-foreground truncate">{song.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                
                {/* Streaming Links */}
                <div className="flex items-center gap-2 pt-2">
                  {spotifyLink && (
                    <a
                      href={spotifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="hidden sm:inline">Spotify</span>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
