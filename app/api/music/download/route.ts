import { NextRequest, NextResponse } from 'next/server'

// Mock music database - simulates real API data
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

    // Search in mock database (case-insensitive)
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
      console.log('[v0] Found song:', track.title)

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
          apiSource: 'spotify-mock',
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
        message: `Could not find "${query}". Try searching for: Blinding Lights, Bohemian Rhapsody, Africa, Shape of You, or Imagine`,
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
