import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export interface DownloadOption {
  quality: string
  size: string
  type: string
  url: string
  source: string
}

interface YTSTorrent {
  url: string
  quality: string
  type: string
  size: string
  hash: string
}

interface YTSMovie {
  title_long: string
  torrents: YTSTorrent[]
}

const TRACKERS = [
  "udp://open.demonii.com:1337/announce",
  "udp://tracker.openbittorrent.com:80",
  "udp://tracker.coppersurfer.tk:6969",
  "udp://glotorrents.pw:6969/announce",
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://torrent.gresille.org:80/announce",
  "udp://p4p.arenabg.com:1337",
  "udp://tracker.leechers-paradise.org:6969",
]

function buildMagnet(hash: string, title: string): string {
  const trackers = TRACKERS.map((t) => `&tr=${encodeURIComponent(t)}`).join("")
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}${trackers}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title")

  if (!title) {
    return NextResponse.json({ options: [], error: "Title is required" }, { status: 400 })
  }

  try {
    // Use YTS API for reliable, legal-grade movie torrent links
    const res = await fetch(
      `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(title)}&limit=1`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) {
      return NextResponse.json({ options: [], error: "Source unavailable" })
    }

    const data = await res.json()
    const movie: YTSMovie | undefined = data?.data?.movies?.[0]

    if (!movie || !movie.torrents) {
      return NextResponse.json({ options: [], notFound: true })
    }

    const options: DownloadOption[] = movie.torrents.map((t) => ({
      quality: t.quality,
      size: t.size,
      type: t.type,
      source: "YTS",
      url: buildMagnet(t.hash, movie.title_long),
    }))

    return NextResponse.json({ options, movieTitle: movie.title_long })
  } catch (error) {
    console.error("[v0] Download fetch error:", error)
    return NextResponse.json({ options: [], error: "Failed to fetch download links" })
  }
}
