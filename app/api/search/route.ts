import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = process.env.TMDB_API_KEY || "bc96f3d21bf9384fe03ffe84bace0ac1"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

// Search movies using Cloudflare-compatible approach
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'multi' // multi, movie, tv

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Add CURL_AUTH_HEADER if available
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const curlAuthHeader = process.env.CURL_AUTH_HEADER
    if (curlAuthHeader) {
      const [key, value] = curlAuthHeader.split(': ')
      if (key && value) {
        headers[key] = value
      }
    }

    // Call TMDB API
    const tmdbUrl = new URL(`${TMDB_BASE_URL}/search/${type}`)
    tmdbUrl.searchParams.set('query', query)
    tmdbUrl.searchParams.set('api_key', TMDB_API_KEY)
    tmdbUrl.searchParams.set('language', 'en-US')

    const response = await fetch(tmdbUrl.toString(), {
      headers,
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Filter results for multi search
    if (type === 'multi') {
      data.results = data.results.filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
      )
    }

    return NextResponse.json({
      query,
      results: data.results || [],
      total_results: data.total_results || 0,
    })
  } catch (error) {
    console.error('[v0] Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
