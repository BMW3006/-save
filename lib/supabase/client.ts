import { createBrowserClient } from '@supabase/ssr'

// Mock channel object for when Supabase is not configured
const mockChannel = () => ({
  on: () => mockChannel(),
  subscribe: (callback?: any) => callback?.('SUBSCRIBED') || { status: 'SUBSCRIBED' },
  unsubscribe: () => Promise.resolve(),
})

// Mock realtime object
const mockRealtime = {
  channel: () => mockChannel(),
}

export function createClient() {
  // Return null if Supabase credentials are not configured
  // This allows the app to run without Supabase when env vars are not set
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // Return a mock client that won't crash but won't do anything
    return {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
      channel: () => mockChannel(),
      realtime: mockRealtime,
    } as any
  }
  
  return createBrowserClient(url, key)
}
