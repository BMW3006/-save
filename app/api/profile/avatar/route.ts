import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`

    // Upload to Vercel Blob
    const { url } = await (await import('@vercel/blob')).put(fileName, file, {
      access: 'public',
      contentType: file.type,
    })

    // Update user profile with avatar URL
    const { data, error } = await supabase
      .from('auth.users')
      .update({
        avatar_url: url,
        profile_updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Avatar update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data, avatar_url: url })
  } catch (error) {
    console.error('[v0] Avatar upload API error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
