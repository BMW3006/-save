import { createBrowserClient } from '@supabase/ssr'

// Mock query builder for method chaining
const createMockQueryBuilder = () => {
  const queryBuilder = {
    select: () => queryBuilder,
    insert: () => queryBuilder,
    update: () => queryBuilder,
    delete: () => queryBuilder,
    eq: () => queryBuilder,
    neq: () => queryBuilder,
    gt: () => queryBuilder,
    gte: () => queryBuilder,
    lt: () => queryBuilder,
    lte: () => queryBuilder,
    like: () => queryBuilder,
    ilike: () => queryBuilder,
    in: () => queryBuilder,
    contains: () => queryBuilder,
    order: () => queryBuilder,
    limit: () => queryBuilder,
    offset: () => queryBuilder,
    range: () => queryBuilder,
    single: () => queryBuilder,
    maybeSingle: () => queryBuilder,
    then: (onSuccess?: any, onError?: any) => {
      try {
        return Promise.resolve({ data: [], error: null }).then(onSuccess, onError)
      } catch (e) {
        return Promise.reject(e)
      }
    },
  } as any
  return queryBuilder
}

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
      from: () => createMockQueryBuilder(),
      channel: () => mockChannel(),
      realtime: mockRealtime,
      removeChannel: () => {},
    } as any
  }
  
  return createBrowserClient(url, key)
}
