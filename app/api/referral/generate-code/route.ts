import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's reference code
    const { data: userData, error: fetchError } = await supabase
      .from('auth.users')
      .select('reference_code')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('[v0] Error fetching user reference code:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reference code' },
        { status: 500 }
      )
    }

    // If user doesn't have a reference code, generate one
    if (!userData?.reference_code) {
      const { data: newCode, error: generateError } = await supabase
        .rpc('generate_reference_code')

      if (generateError) {
        console.error('[v0] Error generating reference code:', generateError)
        return NextResponse.json(
          { success: false, error: 'Failed to generate reference code' },
          { status: 500 }
        )
      }

      // Update user with new code
      const { error: updateError } = await supabase
        .from('auth.users')
        .update({ reference_code: newCode })
        .eq('id', user.id)

      if (updateError) {
        console.error('[v0] Error updating reference code:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to save reference code' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        reference_code: newCode,
        share_url: `${process.env.NEXT_PUBLIC_APP_URL}/referral/${newCode}`
      })
    }

    return NextResponse.json({
      success: true,
      reference_code: userData.reference_code,
      share_url: `${process.env.NEXT_PUBLIC_APP_URL}/referral/${userData.reference_code}`
    })
  } catch (error) {
    console.error('[v0] Generate code error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
