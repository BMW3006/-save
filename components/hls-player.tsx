"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { Loader2, TvMinimal } from "lucide-react"

interface HlsPlayerProps {
  src: string
  poster?: string
}

export function HlsPlayer({ src, poster }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    setIsLoading(true)
    setError(false)

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
      })
      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        video.play().catch(() => {
          // Autoplay blocked, user must click
        })
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.log("[v0] HLS fatal error:", data.type)
          setError(true)
          setIsLoading(false)
        }
      })
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = src
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false)
        video.play().catch(() => {})
      })
      video.addEventListener("error", () => {
        setError(true)
        setIsLoading(false)
      })
    } else {
      setError(true)
      setIsLoading(false)
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src])

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        poster={poster}
        controls
        playsInline
        className="w-full h-full object-contain"
      />

      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading stream...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-3 px-4 text-center">
          <TvMinimal className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Stream unavailable</p>
          <p className="text-xs text-muted-foreground">This channel may be offline. Try another channel.</p>
        </div>
      )}
    </div>
  )
}
