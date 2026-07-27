'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface ProfileAvatarProps {
  avatarUrl?: string | null
  displayName?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProfileAvatar({
  avatarUrl,
  displayName = 'User',
  size = 'md',
  className,
}: ProfileAvatarProps) {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <Avatar className={`${sizeMap[size]} ${className}`}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName || 'User avatar'} />}
      <AvatarFallback className="bg-primary/10 font-semibold">{initials}</AvatarFallback>
    </Avatar>
  )
}
