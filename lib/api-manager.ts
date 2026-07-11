export interface CustomAPI {
  id: string
  name: string
  baseUrl: string
  apiKey?: string
  headers?: Record<string, string>
  description?: string
  endpoints?: APIEndpoint[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface APIEndpoint {
  id: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description?: string
  params?: {
    name: string
    type: string
    required: boolean
  }[]
}

const CUSTOM_APIS_KEY = 'bmw_community_custom_apis'

export function saveCustomAPI(api: Omit<CustomAPI, 'id' | 'createdAt' | 'updatedAt'>): CustomAPI {
  if (typeof window === 'undefined') throw new Error('Storage only available in browser')
  
  const apis = getCustomAPIs()
  const newAPI: CustomAPI = {
    ...api,
    id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  apis.push(newAPI)
  localStorage.setItem(CUSTOM_APIS_KEY, JSON.stringify(apis))
  
  return newAPI
}

export function updateCustomAPI(id: string, updates: Partial<Omit<CustomAPI, 'id' | 'createdAt'>>): CustomAPI | null {
  if (typeof window === 'undefined') return null
  
  const apis = getCustomAPIs()
  const index = apis.findIndex(api => api.id === id)
  
  if (index < 0) return null
  
  const updated: CustomAPI = {
    ...apis[index],
    ...updates,
    id: apis[index].id,
    createdAt: apis[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  
  apis[index] = updated
  localStorage.setItem(CUSTOM_APIS_KEY, JSON.stringify(apis))
  
  return updated
}

export function deleteCustomAPI(id: string): boolean {
  if (typeof window === 'undefined') return false
  
  const apis = getCustomAPIs()
  const filtered = apis.filter(api => api.id !== id)
  
  if (filtered.length === apis.length) return false
  
  localStorage.setItem(CUSTOM_APIS_KEY, JSON.stringify(filtered))
  return true
}

export function getCustomAPIs(): CustomAPI[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(CUSTOM_APIS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getCustomAPI(id: string): CustomAPI | null {
  if (typeof window === 'undefined') return null
  
  const apis = getCustomAPIs()
  return apis.find(api => api.id === id) || null
}

export function testAPIConnection(api: CustomAPI): Promise<{ success: boolean; message: string }> {
  return fetch(`${api.baseUrl}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...api.headers,
      ...(api.apiKey && { 'Authorization': `Bearer ${api.apiKey}` }),
    },
  })
    .then(res => ({
      success: res.ok,
      message: res.ok ? 'API is accessible' : `API returned ${res.status}`,
    }))
    .catch(err => ({
      success: false,
      message: `Connection failed: ${err.message}`,
    }))
}
