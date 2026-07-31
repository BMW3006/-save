import { Router } from 'itty-router'

interface Env {
  CACHE: KVNamespace
  TMDB_API_KEY: string
  CURL_AUTH_HEADER?: string
}

const router = Router()

// Search movies endpoint
router.get('/api/search', async (request: Request, env: Env) => {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const type = url.searchParams.get('type') || 'multi'

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create cache key
    const cacheKey = `search:${query}:${type}`

    // Try to get from cache
    const cached = await env.CACHE.get(cacheKey)
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
          'X-Cache': 'HIT',
        },
      })
    }

    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (env.CURL_AUTH_HEADER) {
      const [key, value] = env.CURL_AUTH_HEADER.split(': ')
      if (key && value) {
        headers[key] = value
      }
    }

    // Call TMDB API
    const tmdbUrl = new URL('https://api.themoviedb.org/3/search/' + type)
    tmdbUrl.searchParams.set('query', query)
    tmdbUrl.searchParams.set('api_key', env.TMDB_API_KEY || 'bc96f3d21bf9384fe03ffe84bace0ac1')
    tmdbUrl.searchParams.set('language', 'en-US')

    const response = await fetch(tmdbUrl.toString(), { headers })

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

    const responseData = JSON.stringify({
      query,
      results: data.results || [],
      total_results: data.total_results || 0,
    })

    // Cache for 1 hour
    await env.CACHE.put(cacheKey, responseData, { expirationTtl: 3600 })

    return new Response(responseData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('[Worker] Search error:', error)
    return new Response(
      JSON.stringify({
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Health check endpoint
router.get('/health', () => {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

// 404 fallback
router.all('*', () => {
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })
})

export default router
