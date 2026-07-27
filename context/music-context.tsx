'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

export interface Track {
  id: string
  title: string
  artist: string
  duration: number
  coverImage: string
  url: string
  videoId?: string
  youtubeUrl?: string
  downloadFormats?: Array<{
    format: string
    url: string
    type?: 'audio' | 'video'
  }>
}

interface MusicContextType {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  setCurrentTrack: (track: Track | null) => void
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  skipForward: () => void
  skipBackward: () => void
  seek: (time: number) => void
  audioRef: React.RefObject<HTMLAudioElement>
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Update current time as audio plays
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Update audio src when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack?.url) {
      audioRef.current.src = currentTrack.url
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log('[v0] Could not play audio:', err.message)
          setIsPlaying(false)
        })
      }
    }
  }, [currentTrack])

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying && currentTrack?.url) {
      audioRef.current.play().catch(err => {
        console.log('[v0] Could not play audio:', err.message)
        setIsPlaying(false)
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentTrack])

  const play = () => {
    setIsPlaying(true)
  }

  const pause = () => {
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 15,
        audioRef.current.duration
      )
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0)
    }
  }

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        setCurrentTrack,
        play,
        pause,
        togglePlayPause,
        skipForward,
        skipBackward,
        seek,
        audioRef,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider')
  }
  return context
}
