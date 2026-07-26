import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const TOKENS_PER_REFERRAL = 100

export async function POST(request: NextRequest) {
  try {
    const { referral_code } = await request.json()

    if (!referral_code) {
      return NextResponse.json(
        { success: false, error: 'Referral code is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find referrer by code
    const { data: referrer, error: refError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('reference_code', referral_code.toUpperCase())
      .single()

    if (refError || !referrer) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    // Create referral record
    const { data: referral, error: createError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_user_id: user.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
        tokens_awarded: TOKENS_PER_REFERRAL
      })
      .select()
      .single()

    if (createError) {
      console.error('[v0] Error creating referral:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create referral' },
        { status: 500 }
      )
    }

    // Award tokens to referrer
    const { error: tokenError } = await supabase
      .from('referral_tokens')
      .insert({
        user_id: referrer.id,
        amount: TOKENS_PER_REFERRAL,
        referral_id: referral.id,
        source: 'referral'
      })

    if (tokenError) {
      console.error('[v0] Error awarding tokens:', tokenError)
    }

    // Update user referrer_id
    const { error: updateError } = await supabase
      .from('auth.users')
      .update({ referrer_id: referrer.id })
      .eq('id', user.id)

    if (updateError) {
      console.error('[v0] Error updating referrer:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Referral claimed successfully',
      tokens_awarded: TOKENS_PER_REFERRAL
    })
  } catch (error) {
    console.error('[v0] Claim referral error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
