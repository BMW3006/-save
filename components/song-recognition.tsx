"use client"

import { useState, useRef } from "react"
import { Mic, MicOff, Search, Loader2, Music2, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type Song, recognizeSongFromUrl, getAlbumArt, getStreamingLink } from "@/lib/audd"
import { cn } from "@/lib/utils"

interface SongRecognitionProps {
  onSongRecognized?: (song: Song) => void
}

export function SongRecognition({ onSongRecognized }: SongRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [recognizedSong, setRecognizedSong] = useState<Song | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const handleRecognizeFromUrl = async () => {
    if (!audioUrl.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await recognizeSongFromUrl(audioUrl)
      
      if (result.status === "success" && result.result) {
        setRecognizedSong(result.result)
        setShowModal(true)
        onSongRecognized?.(result.result)
      } else if (result.error) {
        setError(result.error.error_message)
      } else {
        setError("No song found. Try a different audio clip.")
      }
    } catch {
      setError("Failed to recognize song. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        stream.getTracks().forEach(track => track.stop())
        
        // Here you would normally upload the blob and get a URL
        // For demo purposes, we'll show a message
        setError("Voice recognition requires uploading audio. Please use URL recognition instead.")
        setIsLoading(false)
        setIsListening(false)
      }

      mediaRecorder.start()
      setIsListening(true)
      setError(null)

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop()
          setIsLoading(true)
        }
      }, 10000)
    } catch {
      setError("Microphone access denied. Please allow microphone access.")
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsLoading(true)
    }
    setIsListening(false)
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
            <h3 className="font-semibold text-foreground">Song Recognition</h3>
            <p className="text-sm text-muted-foreground">Identify songs using AudD API</p>
          </div>
        </div>

        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Paste audio URL here..."
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            className="flex-1 bg-secondary/50"
          />
          <Button 
            onClick={handleRecognizeFromUrl} 
            disabled={!audioUrl.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Voice Recognition Button */}
        <div className="flex items-center gap-4">
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="lg"
            className={cn(
              "flex-1 h-14 gap-3",
              isListening && "animate-pulse"
            )}
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5" />
                <span>Stop Listening</span>
                <span className="text-xs opacity-70">(Recording...)</span>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                <span>Start Listening</span>
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Listening Animation */}
        {isListening && (
          <div className="flex items-center justify-center gap-1 py-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 30 + 10}px`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
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

          {recognizedSong && (
            <div className="space-y-4">
              {/* Album Art */}
              <div className="flex items-start gap-4">
                <img
                  src={getAlbumArt(recognizedSong)}
                  alt={recognizedSong.album}
                  className="w-24 h-24 rounded-lg object-cover shadow-lg"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-lg">{recognizedSong.title}</h4>
                  <p className="text-muted-foreground">{recognizedSong.artist}</p>
                  <p className="text-sm text-muted-foreground">{recognizedSong.album}</p>
                  {recognizedSong.release_date && (
                    <p className="text-xs text-muted-foreground">Released: {recognizedSong.release_date}</p>
                  )}
                </div>
              </div>

              {/* Streaming Links */}
              <div className="flex flex-wrap gap-2">
                {getStreamingLink(recognizedSong, "spotify") && (
                  <a
                    href={getStreamingLink(recognizedSong, "spotify")!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1DB954] text-white text-sm hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Spotify
                  </a>
                )}
                {recognizedSong.song_link && (
                  <a
                    href={recognizedSong.song_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Listen
                  </a>
                )}
              </div>

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
