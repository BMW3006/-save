import { NextRequest, NextResponse } from 'next/server'

// Azbry Music API - Primary source for all music searches
const AZBRY_API = 'https://api.azbry.com/api/download/ytplay'

async function searchAzbryMusic(query: string) {
  try {
    const response = await fetch(`${AZBRY_API}?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 30000,
    })

    if (!response.ok) {
      console.log('[v0] Azbry API error:', response.status)
      return null
    }

    const data = await response.json()
    console.log('[v0] Azbry API response:', JSON.stringify(data, null, 2))
    
    // Check if the API returned a successful result
    if (data && data.status === true && data.result) {
      const track = data.result
      console.log('[v0] Song found on Azbry:', track.title)
      
      // Parse duration from string format (e.g., "4:23" to seconds)
      let durationSeconds = 0
      if (track.duration) {
        const parts = String(track.duration).split(':')
        if (parts.length === 2) {
          durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1])
        } else if (parts.length === 3) {
          durationSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
        } else if (typeof track.duration === 'number') {
          durationSeconds = track.duration
        }
      }
      
      // Extract thumbnail/cover image - try multiple possible fields
      const coverImage = 
        track.thumbnail || 
        track.thumbnails?.[0] || 
        track.cover || 
        track.image || 
        track.thumb ||
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
      
      // Extract download URL from available fields
      const downloadUrl = 
        track.download || 
        track.downloadUrl || 
        track.link || 
        track.url || 
        ''
      
      return {
        id: track.videoId || track.id || `azbry-${Date.now()}`,
        title: track.title || 'Unknown Title',
        artist: track.channel || track.artist || track.author || 'Various Artists',
        duration: durationSeconds,
        coverImage: coverImage,
        source: 'Azbry Music',
        url: downloadUrl,
        downloadFormats: downloadUrl ? [
          {
            format: 'MP3 (320kbps)',
            url: downloadUrl,
          },
        ] : [],
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
      }
    }
    
    console.log('[v0] Azbry API returned no results:', data)
    return null
  } catch (error: any) {
    console.error('[v0] Azbry API error:', error.message)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      )
    }

    console.log('[v0] Searching for:', query)

    // Search using Azbry API
    const track = await searchAzbryMusic(query)
    if (track) {
      return NextResponse.json({
        success: true,
        data: track,
      })
    }

    console.log('[v0] No songs found for query:', query)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Song not found',
        message: `Could not find "${query}" on Azbry Music. Please try another search.`,
      },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('[v0] Music API error:', error)
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

  const body = JSON.stringify({ query })
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    body: body,
    headers: request.headers,
  })

  return POST(postRequest)
}
