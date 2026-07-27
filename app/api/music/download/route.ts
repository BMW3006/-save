import { NextRequest, NextResponse } from 'next/server'

// YouTube Music API using azbry service
const YOUTUBE_MUSIC_API = 'https://api.azbry.com/api/download/ytplay'

// Mock music database - fallback for demo purposes
const MOCK_SONGS: Record<string, any[]> = {
  'blinding lights': [
    {
      id: 'song_1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      duration: 200,
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/blinding-lights-320.mp3',
        },
      ],
    },
  ],
  'bohemian rhapsody': [
    {
      id: 'song_2',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      duration: 354,
      coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/bohemian-rhapsody-320.mp3',
        },
      ],
    },
  ],
  'africa': [
    {
      id: 'song_3',
      title: 'Africa',
      artist: 'Toto',
      duration: 295,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/africa-320.mp3',
        },
      ],
    },
  ],
  'shape of you': [
    {
      id: 'song_4',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      duration: 233,
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/shape-of-you-320.mp3',
        },
      ],
    },
  ],
  'imagine': [
    {
      id: 'song_5',
      title: 'Imagine',
      artist: 'John Lennon',
      duration: 183,
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/imagine-320.mp3',
        },
      ],
    },
  ],
  'mbosso': [
    {
      id: 'song_6',
      title: 'Yanga Boy',
      artist: 'Mbosso',
      duration: 237,
      coverImage: 'https://images.unsplash.com/photo-1526336024174-c27aeeb361ec?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/yanga-boy-320.mp3',
        },
      ],
    },
    {
      id: 'song_7',
      title: 'Hodari',
      artist: 'Mbosso',
      duration: 213,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/hodari-320.mp3',
        },
      ],
    },
  ],
  'dj': [
    {
      id: 'song_6',
      title: 'Yanga Boy',
      artist: 'Mbosso',
      duration: 237,
      coverImage: 'https://images.unsplash.com/photo-1526336024174-c27aeeb361ec?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/yanga-boy-320.mp3',
        },
      ],
    },
  ],
  'wasafi': [
    {
      id: 'song_8',
      title: 'Ye',
      artist: 'Diamond Platnumz',
      duration: 280,
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/ye-320.mp3',
        },
      ],
    },
  ],
  'diamond platnumz': [
    {
      id: 'song_8',
      title: 'Ye',
      artist: 'Diamond Platnumz',
      duration: 280,
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/ye-320.mp3',
        },
      ],
    },
  ],
  'harmonize': [
    {
      id: 'song_9',
      title: 'Mbongo',
      artist: 'Harmonize',
      duration: 210,
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/mbongo-320.mp3',
        },
      ],
    },
  ],
  'rayvanny': [
    {
      id: 'song_10',
      title: 'Down',
      artist: 'Rayvanny',
      duration: 198,
      coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/down-320.mp3',
        },
      ],
    },
  ],
  'tanzanian': [
    {
      id: 'song_6',
      title: 'Yanga Boy',
      artist: 'Mbosso',
      duration: 237,
      coverImage: 'https://images.unsplash.com/photo-1526336024174-c27aeeb361ec?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/yanga-boy-320.mp3',
        },
      ],
    },
    {
      id: 'song_8',
      title: 'Ye',
      artist: 'Diamond Platnumz',
      duration: 280,
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      source: 'Spotify',
      downloadFormats: [
        {
          format: 'MP3 (320kbps)',
          url: 'https://example.com/ye-320.mp3',
        },
      ],
    },
  ],
}

async function searchYouTubeMusic(query: string) {
  try {
    const response = await fetch(`${YOUTUBE_MUSIC_API}?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.log('[v0] YouTube Music API error:', response.status)
      return null
    }

    const data = await response.json()
    
    // Check if the API returned a successful result
    if (data && data.status === true && data.result) {
      const track = data.result
      console.log('[v0] YouTube Music found:', track.title)
      console.log('[v0] Track data:', JSON.stringify(track, null, 2))
      
      // Parse duration from string format (e.g., "4:23" to seconds)
      let durationSeconds = 0
      if (track.duration) {
        const parts = track.duration.split(':')
        if (parts.length === 2) {
          durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1])
        } else if (parts.length === 3) {
          durationSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
        }
      }
      
      // Extract all available thumbnails (high quality preference)
      const coverImage = track.thumbnail || track.thumbnails?.[0] || track.cover || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
      
      // Build download formats from available links
      const downloadFormats = []
      if (track.download) {
        downloadFormats.push({
          format: 'MP3 (320kbps)',
          url: track.download,
        })
      } else if (track.downloadUrl) {
        downloadFormats.push({
          format: 'MP3 (320kbps)',
          url: track.downloadUrl,
        })
      } else if (track.link) {
        downloadFormats.push({
          format: 'MP3 (320kbps)',
          url: track.link,
        })
      } else if (track.url) {
        downloadFormats.push({
          format: 'MP3 (320kbps)',
          url: track.url,
        })
      }
      
      return {
        id: track.videoId || track.id || `yt-${Date.now()}`,
        title: track.title || 'Unknown Title',
        artist: track.channel || track.artist || 'Various Artists',
        duration: durationSeconds,
        coverImage: coverImage,
        source: 'YouTube Music',
        url: track.url || track.download || track.link || '',
        downloadFormats: downloadFormats.length > 0 ? downloadFormats : [
          {
            format: 'MP3 (320kbps)',
            url: track.download || track.url || '',
          },
        ],
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
    
    console.log('[v0] YouTube Music API returned no results:', data)
    return null
  } catch (error: any) {
    console.error('[v0] YouTube Music API error:', error.message)
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

    // First try YouTube Music API
    const youtubeTrack = await searchYouTubeMusic(query)
    if (youtubeTrack) {
      return NextResponse.json({
        success: true,
        data: youtubeTrack,
      })
    }

    // Fallback to mock database if API fails
    const searchQuery = query.toLowerCase().trim()
    let results = []

    // Look for exact matches or partial matches
    for (const [key, songs] of Object.entries(MOCK_SONGS)) {
      if (key.includes(searchQuery) || searchQuery.includes(key)) {
        results = songs
        break
      }
    }

    // If no exact match, search for songs containing any part of the query
    if (results.length === 0) {
      const words = searchQuery.split(' ')
      for (const word of words) {
        for (const [key, songs] of Object.entries(MOCK_SONGS)) {
          if (key.includes(word)) {
            results = songs
            break
          }
        }
        if (results.length > 0) break
      }
    }

    if (results.length > 0) {
      const track = results[0]
      console.log('[v0] Found song in mock database:', track.title)

      return NextResponse.json({
        success: true,
        data: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          url: '',
          duration: track.duration,
          coverImage: track.coverImage,
          source: track.source,
          downloadFormats: track.downloadFormats,
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

    console.log('[v0] No songs found for query:', query)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Song not found',
        message: `Could not find "${query}". Try searching for popular songs like "Blinding Lights", "Bohemian Rhapsody", or "Africa".`,
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
