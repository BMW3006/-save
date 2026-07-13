import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const NOVASCORE_API = 'https://live-novascore.officialhectormanuel.workers.dev/api'

export async function GET(request: NextRequest) {
  try {
    const league = request.nextUrl.searchParams.get('league') || '1'
    const season = request.nextUrl.searchParams.get('season') || '2026'

    const response = await axios.get(`${NOVASCORE_API}/topscorers`, {
      params: { league, season },
      timeout: 10000,
    })

    return NextResponse.json({
      success: true,
      data: response.data,
    })
  } catch (error: any) {
    console.error('[v0] Top scorers API error:', error.message)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch top scorers',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
