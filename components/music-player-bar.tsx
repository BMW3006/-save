'use client'

import { useMusic } from '@/context/music-context'
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function MusicPlayerBar() {
  const { currentTrack, isPlaying, currentTime, togglePlayPause, skipForward, skipBackward, seek, setCurrentTrack } = useMusic()
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = new Audio(currentTrack?.url || '')
    audio.onloadedmetadata = () => setDuration(audio.duration)
    return () => audio.pause()
  }, [currentTrack?.url])

  if (!currentTrack) return null

  const percentage = duration ? (currentTime / duration) * 100 : 0
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background to-background/95 border-t border-border px-4 py-3 z-40 space-y-2">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden cursor-pointer" 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percentage = (e.clientX - rect.left) / rect.width
            seek(percentage * duration)
          }}>
          <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
        </div>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Player Controls and Info */}
      <div className="flex items-center gap-3 justify-between">
        {/* Song Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img 
            src={currentTrack.coverImage} 
            alt={currentTrack.title}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={skipBackward}
            className="h-8 w-8 p-0"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button 
            size="sm" 
            onClick={togglePlayPause}
            className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            onClick={skipForward}
            className="h-8 w-8 p-0"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setCurrentTrack(null)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
