import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Reference code is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find user with this reference code
    const { data: referrer, error: fetchError } = await supabase
      .from('auth.users')
      .select('id, email, reference_code')
      .eq('reference_code', code.toUpperCase())
      .single()

    if (fetchError || !referrer) {
      return NextResponse.json(
        { success: false, error: 'Invalid reference code' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      referrer: {
        id: referrer.id,
        email: referrer.email
      }
    })
  } catch (error) {
    console.error('[v0] Validate code error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
