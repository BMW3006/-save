// Social media and sharing utilities

export interface ShareOptions {
  title: string
  description?: string
  url: string
  image?: string
  type: 'movie' | 'song' | 'general'
}

export interface ShareLinks {
  whatsapp: string
  facebook: string
  twitter: string
  telegram: string
  copy: string
}

export const SUPPORT_WHATSAPP = 'https://wa.me/message/AVJL7EJ3SZBEE1'

export function generateShareLinks(options: ShareOptions): ShareLinks {
  const encodedUrl = encodeURIComponent(options.url)
  const encodedTitle = encodeURIComponent(options.title)
  const encodedDescription = encodeURIComponent(options.description || '')

  return {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    copy: options.url,
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function openWhatsAppShare(shareUrl: string, title: string): void {
  const message = `${title}\n${shareUrl}`
  const encodedMessage = encodeURIComponent(message)
  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
}

export function openWhatsAppSupport(): void {
  window.open(SUPPORT_WHATSAPP, '_blank')
}

export function generateMovieShareUrl(movieId: number, movieTitle: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  // Using the share path format: /share/[id]/[slug]
  const slug = movieTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  return `${baseUrl}/share/movie/${movieId}/${slug}`
}

export function generateSongShareUrl(songId: string, songTitle: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const slug = songTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  return `${baseUrl}/share/song/${songId}/${slug}`
}
