import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// IPTV playlist sources
const PLAYLISTS: Record<string, string> = {
  tubi: "https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/refs/heads/main/playlists/tubi_all.m3u",
  movies: "https://iptv-org.github.io/iptv/categories/movies.m3u",
  news: "https://iptv-org.github.io/iptv/categories/news.m3u",
  music: "https://iptv-org.github.io/iptv/categories/music.m3u",
  sports: "https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/refs/heads/main/playlists/tubi_all.m3u",
  freetv: "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",
}

export interface Channel {
  name: string
  logo: string
  group: string
  url: string
}

function parseM3U(content: string): Channel[] {
  const channels: Channel[] = []
  const lines = content.split("\n")
  let current: Partial<Channel> = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith("#EXTINF:")) {
      // Extract attributes
      const nameMatch = line.match(/tvg-name="([^"]*)"/)
      const logoMatch = line.match(/tvg-logo="([^"]*)"/)
      const groupMatch = line.match(/group-title="([^"]*)"/)
      // Channel display name after the last comma
      const displayName = line.substring(line.lastIndexOf(",") + 1).trim()

      current = {
        name: displayName || nameMatch?.[1] || "Unknown Channel",
        logo: logoMatch?.[1] || "",
        group: groupMatch?.[1] || "General",
      }
    } else if (line && !line.startsWith("#")) {
      // This is the stream URL
      if (current.name) {
        current.url = line
        channels.push(current as Channel)
        current = {}
      }
    }
  }

  return channels
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get("source") || "tubi"

  try {
    const playlistUrl = PLAYLISTS[source] || PLAYLISTS.tubi

    const res = await fetch(playlistUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ channels: [], error: "Failed to fetch playlist" }, { status: 200 })
    }

    const text = await res.text()
    const channels = parseM3U(text)

    // Limit to first 300 channels for performance
    return NextResponse.json({ channels: channels.slice(0, 300) })
  } catch (error) {
    console.error("[v0] Live TV fetch error:", error)
    return NextResponse.json({ channels: [], error: "Failed to load channels" }, { status: 200 })
  }
}
