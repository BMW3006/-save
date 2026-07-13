import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const NOVASCORE_API = 'https://live-novascore.officialhectormanuel.workers.dev/api'

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get(`${NOVASCORE_API}/matches`, {
      timeout: 10000,
    })

    return NextResponse.json({
      success: true,
      data: response.data,
    })
  } catch (error: any) {
    console.error('[v0] Football API error:', error.message)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch matches',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
