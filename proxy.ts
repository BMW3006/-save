// Supabase middleware disabled - not required for this application
// If Supabase authentication is needed in the future, uncomment and configure
// with proper NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars

import { type NextRequest, NextResponse } from 'next/server'

// No-op proxy - just pass requests through
export default async function proxy(request: NextRequest) {
  return NextResponse.next({ request })
}
