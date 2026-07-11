import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const movieId = searchParams.get('movieId')

  try {
    let query = supabase
      .from('downloads')
      .select('*')
      .eq('is_active', true)

    if (title) {
      query = query.ilike('movie_title', `%${title}%`)
    }

    if (movieId) {
      query = query.eq('movie_id', parseInt(movieId))
    }

    const { data, error } = await query.order('source_type', { ascending: true })

    if (error) throw error

    return NextResponse.json({ downloads: data || [] })
  } catch (error) {
    console.error('[v0] Downloads API error:', error)
    return NextResponse.json({ error: 'Failed to fetch downloads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const {
      movie_id,
      movie_title,
      movie_poster,
      source_name,
      source_type,
      quality,
      url,
      file_size,
      seeders,
    } = body

    const { data, error } = await supabase
      .from('downloads')
      .insert([
        {
          movie_id,
          movie_title,
          movie_poster,
          source_name,
          source_type,
          quality,
          url,
          file_size,
          seeders,
          is_active: true,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ download: data?.[0] }, { status: 201 })
  } catch (error) {
    console.error('[v0] Downloads POST error:', error)
    return NextResponse.json({ error: 'Failed to create download' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const { error } = await supabase.from('downloads').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Downloads DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete download' }, { status: 500 })
  }
}
