import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies()
  
  // Return mock client if Supabase credentials are not configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    return {
      auth: {
        exchangeCodeForSession: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => createMockQueryBuilder(),
    } as any
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  )
}
