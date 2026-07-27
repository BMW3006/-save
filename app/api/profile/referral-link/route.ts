import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's reference code
    const { data: user, error } = await supabase
      .from('auth.users')
      .select('reference_code, display_name')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('[v0] Referral link fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch referral code' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bmwcommunity.vercel.app'
    const referralUrl = `${baseUrl}/referral/${user.reference_code}`
    const displayName = user.display_name || 'BMW Community'

    return NextResponse.json({
      success: true,
      referral_code: user.reference_code,
      referral_url: referralUrl,
      display_name: displayName,
      share_message: `Join me on BMW Community! Use my referral code ${user.reference_code} or click: ${referralUrl}`,
    })
  } catch (error) {
    console.error('[v0] Referral link API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
