"use client"

import { useState, useEffect } from "react"
import { Tv, Radio, Newspaper, Music, Film, Loader2, Search, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HlsPlayer } from "@/components/hls-player"
import type { Channel } from "@/app/api/livetv/route"

import { Trophy } from "lucide-react"

const SOURCES = [
  { id: "tubi", label: "Tubi TV", icon: Tv, recommended: true },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "movies", label: "Movies", icon: Film },
  { id: "news", label: "News", icon: Newspaper },
  { id: "music", label: "Music", icon: Music },
  { id: "freetv", label: "Free TV", icon: Radio },
]

export function LiveTVSection() {
  const [source, setSource] = useState("tubi")
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true)
      setSelectedChannel(null)
      try {
        const res = await fetch(`/api/livetv?source=${source}`)
        const data = await res.json()
        setChannels(data.channels || [])
        if (data.channels?.length > 0) {
          setSelectedChannel(data.channels[0])
        }
      } catch (error) {
        console.error("[v0] Failed to load channels:", error)
        setChannels([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchChannels()
  }, [source])

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Tv className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Live TV</h2>
          <p className="text-sm text-muted-foreground">Stream live channels for free</p>
        </div>
      </div>

      {/* Source Tabs */}
      <div className="flex flex-wrap gap-2">
        {SOURCES.map((s) => (
          <Button
            key={s.id}
            variant={source === s.id ? "default" : "secondary"}
            size="sm"
            onClick={() => setSource(s.id)}
            className="gap-1.5 relative"
          >
            <s.icon className="h-4 w-4" />
            {s.label}
            {s.recommended && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-bold">
                BEST
              </span>
            )}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading channels...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player */}
          <div className="lg:col-span-2 space-y-3">
            {selectedChannel ? (
              <>
                <HlsPlayer src={selectedChannel.url} poster={selectedChannel.logo} />
                <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                  {selectedChannel.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedChannel.logo || "/placeholder.svg"}
                      alt={selectedChannel.name}
                      className="h-10 w-10 rounded object-contain bg-secondary"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                      <Tv className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{selectedChannel.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedChannel.group}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="aspect-video bg-card rounded-xl border border-border flex items-center justify-center">
                <p className="text-muted-foreground">Select a channel to start watching</p>
              </div>
            )}
          </div>

          {/* Channel List */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              {filteredChannels.length} channels available
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredChannels.map((channel, idx) => (
                <button
                  key={`${channel.name}-${idx}`}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                    selectedChannel?.url === channel.url
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-secondary text-foreground"
                  }`}
                >
                  {channel.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={channel.logo || "/placeholder.svg"}
                      alt={channel.name}
                      className="h-8 w-8 rounded object-contain bg-secondary/50 shrink-0"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-secondary/50 flex items-center justify-center shrink-0">
                      <Tv className="h-4 w-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium truncate flex-1">{channel.name}</span>
                  <Play className="h-3.5 w-3.5 shrink-0 opacity-60" />
                </button>
              ))}

              {filteredChannels.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No channels found
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
