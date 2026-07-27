'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Loader2, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ProfileAvatar } from './profile-avatar'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile?: {
    id: string
    email: string
    display_name?: string | null
    avatar_url?: string | null
  }
}

export function ProfileModal({ isOpen, onClose, profile }: ProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setAvatarUrl(profile.avatar_url || '')
      setAvatarPreview(profile.avatar_url || '')
    }
  }, [profile, isOpen])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to API
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Upload failed')
        return
      }

      setAvatarUrl(data.avatar_url)
      toast.success('Avatar uploaded successfully')
    } catch (error) {
      console.error('[v0] Avatar upload error:', error)
      toast.error('Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Display name is required')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          avatar_url: avatarUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Update failed')
        return
      }

      toast.success('Profile updated successfully')
      onClose()
    } catch (error) {
      console.error('[v0] Profile update error:', error)
      toast.error('Update failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information and avatar</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <ProfileAvatar avatarUrl={avatarPreview} displayName={displayName} size="lg" />
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP or GIF (Max 5MB)</p>
          </div>

          {/* Display Name Section */}
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              type="text"
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email || ''} disabled />
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isLoading} className="w-full gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
