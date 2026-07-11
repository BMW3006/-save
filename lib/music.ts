export interface MusicTrack {
  id: string
  title: string
  artist: string
  url: string
  duration: number
  coverImage?: string
  source: string
  qualityOptions?: {
    quality: string
    bitrate: string
    format: string
  }[]
  downloadFormats?: {
    format: string
    url: string
  }[]
  addedAt?: string
}

export interface MusicResponse {
  success: boolean
  data?: MusicTrack | MusicTrack[]
  error?: string
  message?: string
}

// Local storage keys
const MUSIC_STORAGE_KEY = 'bmw_community_music'
const FAVORITE_TRACKS_KEY = 'bmw_community_favorite_tracks'

export function saveMusicTrack(track: MusicTrack): void {
  if (typeof window === 'undefined') return
  
  const tracks = getMusicTracks()
  const existingIndex = tracks.findIndex(t => t.id === track.id)
  
  if (existingIndex >= 0) {
    tracks[existingIndex] = { ...track, addedAt: new Date().toISOString() }
  } else {
    tracks.push({ ...track, addedAt: new Date().toISOString() })
  }
  
  localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify(tracks))
}

export function getMusicTracks(): MusicTrack[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(MUSIC_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function removeMusicTrack(trackId: string): void {
  if (typeof window === 'undefined') return
  
  const tracks = getMusicTracks()
  const filtered = tracks.filter(t => t.id !== trackId)
  localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify(filtered))
}

export function addFavoriteTrack(track: MusicTrack): void {
  if (typeof window === 'undefined') return
  
  const favorites = getFavoriteTracks()
  const exists = favorites.find(t => t.id === track.id)
  
  if (!exists) {
    favorites.push(track)
    localStorage.setItem(FAVORITE_TRACKS_KEY, JSON.stringify(favorites))
  }
}

export function removeFavoriteTrack(trackId: string): void {
  if (typeof window === 'undefined') return
  
  const favorites = getFavoriteTracks()
  const filtered = favorites.filter(t => t.id !== trackId)
  localStorage.setItem(FAVORITE_TRACKS_KEY, JSON.stringify(filtered))
}

export function getFavoriteTracks(): MusicTrack[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(FAVORITE_TRACKS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function isFavorited(trackId: string): boolean {
  if (typeof window === 'undefined') return false
  
  const favorites = getFavoriteTracks()
  return favorites.some(t => t.id === trackId)
}
