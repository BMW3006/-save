'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Music, Download, Heart, Search, Loader2, MessageCircle } from 'lucide-react'
import { MusicTrack, saveMusicTrack, addFavoriteTrack, removeFavoriteTrack, isFavorited } from '@/lib/music'
import { generateSongShareUrl, SUPPORT_WHATSAPP } from '@/lib/share'
import { ShareButton } from './share-button'

export function MusicSearch() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [track, setTrack] = useState<MusicTrack | null>(null)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setTrack(null)

    try {
      const response = await fetch('/api/music/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setTrack(data.data)
        setIsFavorite(isFavorited(data.data.id))
      } else {
        setError(data.message || 'Failed to find song')
      }
    } catch (err) {
      setError('Error searching for music. Please try again.')
      console.error('[v0] Music search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (track: MusicTrack) => {
    if (track.downloadFormats && track.downloadFormats.length > 0) {
      const downloadUrl = track.downloadFormats[0].url
      if (downloadUrl) {
        window.open(downloadUrl, '_blank')
        saveMusicTrack(track)
      }
    }
  }

  const toggleFavorite = (track: MusicTrack) => {
    if (isFavorite) {
      removeFavoriteTrack(track.id)
      setIsFavorite(false)
    } else {
      addFavoriteTrack(track)
      setIsFavorite(true)
    }
  }

  return (
    <div className="w-full space-y-6 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Music className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Music Search & Download</h2>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Search for a song or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </Button>
        </form>

        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}

        {track && (
          <Card className="p-6 space-y-4">
            <div className="flex gap-4">
              {track.coverImage && (
                <img
                  src={track.coverImage}
                  alt={track.title}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-bold">{track.title}</h3>
                  <p className="text-muted-foreground">{track.artist}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Duration:</span> {track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Source:</span> {track.source}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap pt-2">
                  <Button
                    onClick={() => handleDownload(track)}
                    disabled={!track.downloadFormats?.length}
                    variant="default"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    onClick={() => toggleFavorite(track)}
                    variant={isFavorite ? 'default' : 'outline'}
                    className="gap-2"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
                    />
                    {isFavorite ? 'Favorited' : 'Favorite'}
                  </Button>
                  <ShareButton
                    title={`${track.title} by ${track.artist}`}
                    description={`Listen to ${track.title} by ${track.artist}`}
                    url={generateSongShareUrl(track.id, track.title)}
                    type="song"
                    showFeedback
                  />
                  <Button
                    onClick={() => window.open(SUPPORT_WHATSAPP, '_blank')}
                    variant="outline"
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Feedback
                  </Button>
                </div>
              </div>
            </div>

            {track.qualityOptions && track.qualityOptions.length > 0 && (
              <div className="border-t pt-4">
                <p className="font-semibold mb-2">Available Quality Options:</p>
                <div className="grid grid-cols-2 gap-2">
                  {track.qualityOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded border bg-muted/50 text-sm"
                    >
                      <p className="font-medium">{option.quality}</p>
                      <p className="text-muted-foreground">{option.bitrate} • {option.format}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
