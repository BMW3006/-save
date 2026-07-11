import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const MUSIC_API_BASE = 'https://apis.davidcyriltech.my.id/endpoints/download'

interface DownloadResponse {
  status: boolean
  data?: {
    title?: string
    artist?: string
    url?: string
    download?: {
      quality?: string
      url?: string
    }
    thumbnail?: string
    duration?: number
  }
  error?: string
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, type = 'song' } = body

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Try to fetch from the davidcyriltech API
    try {
      const response = await axios.post(
        `${MUSIC_API_BASE}/song-download`,
        { query },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = response.data as DownloadResponse

      if (data.status && data.data) {
        return NextResponse.json({
          success: true,
          data: {
            id: `music_${Date.now()}`,
            title: data.data.title || 'Unknown Title',
            artist: data.data.artist || 'Unknown Artist',
            url: data.data.url || '',
            duration: data.data.duration || 0,
            coverImage: data.data.thumbnail || '',
            source: 'YouTube',
            downloadFormats: data.data.download
              ? [
                  {
                    format: data.data.download.quality || 'MP3',
                    url: data.data.download.url || '',
                  },
                ]
              : [],
            qualityOptions: [
              {
                quality: 'High',
                bitrate: '320kbps',
                format: 'MP3',
              },
              {
                quality: 'Medium',
                bitrate: '192kbps',
                format: 'MP3',
              },
              {
                quality: 'Low',
                bitrate: '128kbps',
                format: 'MP3',
              },
            ],
          },
        })
      }

      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to download song',
        message: data.message || 'No results found',
      })
    } catch (apiError: any) {
      console.error('[v0] Music API error:', apiError.message)

      // Return graceful error response
      return NextResponse.json(
        {
          success: false,
          error: 'Music service unavailable',
          message: 'The music download service is currently unavailable. Please try again later.',
        },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error('[v0] Music download route error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Search query is required' },
      { status: 400 }
    )
  }

  // Forward to POST for simplicity
  return POST(
    new NextRequest('http://localhost/api/music/download', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  )
}
