'use client'

import { useState, useEffect } from 'react'
import { Loader2, Edit, Gift, Users, Copy, Check, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProfileAvatar } from '@/components/profile/profile-avatar'
import { ProfileModal } from '@/components/profile/profile-modal'
import { ProfileReferralShare } from '@/components/profile/profile-referral-share'
import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        redirect('/') // Redirect to home if not logged in
      }

      const res = await fetch('/api/profile/fetch')
      const data = await res.json()

      if (res.ok) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('[v0] Fetch profile error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyWebsiteLink = () => {
    if (!profile?.reference_code) return
    const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://nadhili-db.vercel.app'}/referral/${profile.reference_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Website link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Profile Header Card */}
        <Card className="p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ProfileAvatar
              avatarUrl={profile.avatar_url}
              displayName={profile.display_name}
              size="lg"
            />

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold">{profile.display_name || 'User'}</h1>
              <p className="text-muted-foreground">{profile.email}</p>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  onClick={() => setShowProfileModal(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Referral Tokens</p>
                <p className="text-2xl font-bold">{profile.referral_tokens || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-lg">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Referral Code</p>
                <p className="text-2xl font-bold font-mono">{profile.reference_code}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Website Link with Reference Code */}
        <Card className="p-6 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <LinkIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Share Your Referral Link</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share this link with friends to earn 100 tokens per successful referral
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : 'https://nadhili-db.vercel.app'}/referral/${profile?.reference_code || ''}`}
                  className="bg-background/50"
                />
                <Button
                  onClick={copyWebsiteLink}
                  className="gap-2 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral Share Section */}
        <ProfileReferralShare />

        {/* Profile Info Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            {profile.display_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Display Name</span>
                <span className="font-medium">{profile.display_name}</span>
              </div>
            )}
            {profile.reference_code && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference Code</span>
                <span className="font-medium font-mono">{profile.reference_code}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          fetchProfile()
        }}
        profile={profile}
      />
    </div>
  )
}
