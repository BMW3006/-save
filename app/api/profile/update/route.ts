import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { display_name, avatar_url } = await request.json()

    if (!display_name || display_name.trim().length === 0) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 })
    }

    // Update auth.users table directly via admin
    const { data, error } = await supabase
      .from('auth.users')
      .update({
        display_name: display_name.trim(),
        avatar_url: avatar_url || null,
        profile_updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Profile update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error('[v0] Profile update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
