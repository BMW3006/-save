import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user referral stats
    const { data: referrals, error: refError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)

    const { data: tokens, error: tokenError } = await supabase
      .from('referral_tokens')
      .select('amount')
      .eq('user_id', user.id)

    if (refError || tokenError) {
      console.error('[v0] Error fetching referral data:', { refError, tokenError })
      return NextResponse.json(
        { success: false, error: 'Failed to fetch referral data' },
        { status: 500 }
      )
    }

    const completedReferrals = referrals?.filter(r => r.status === 'completed') || []
    const totalTokens = tokens?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

    return NextResponse.json({
      success: true,
      stats: {
        total_referrals: referrals?.length || 0,
        completed_referrals: completedReferrals.length,
        total_tokens: totalTokens,
        tokens_per_referral: 100
      }
    })
  } catch (error) {
    console.error('[v0] Profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
