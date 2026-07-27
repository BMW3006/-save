'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Share2, Trophy, Users, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface ReferralStats {
  total_referrals: number
  completed_referrals: number
  total_tokens: number
  tokens_per_referral: number
}

export function ReferralCard() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referralCode, setReferralCode] = useState<string>('')
  const [shareUrl, setShareUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const [profileRes, codeRes] = await Promise.all([
          fetch('/api/referral/profile'),
          fetch('/api/referral/generate-code')
        ])

        const profileData = await profileRes.json()
        const codeData = await codeRes.json()

        if (profileData.success) setStats(profileData.stats)
        if (codeData.success) {
          setReferralCode(codeData.reference_code)
          setShareUrl(codeData.share_url)
        }
      } catch (error) {
        console.error('[v0] Error fetching referral data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode)
    toast.success('Reference code copied!')
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied!')
  }

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-muted rounded mb-4 w-24"></div>
        <div className="h-10 bg-muted rounded"></div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Referral Program
            </h3>
            <p className="text-sm text-muted-foreground">Share & earn tokens</p>
          </div>
        </div>

        {/* Reference Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Reference Code</label>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-sm font-bold">
              {referralCode}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
        </div>

        {/* Share URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Share Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm truncate"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={copyShareUrl}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stats?.completed_referrals || 0}</div>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{stats?.total_tokens || 0}</div>
            <p className="text-xs text-muted-foreground">Tokens</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold">{stats?.tokens_per_referral || 0}</div>
            <p className="text-xs text-muted-foreground">Per Ref</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <Button className="w-full gap-2" onClick={copyShareUrl}>
          <Share2 className="w-4 h-4" />
          Share Now
        </Button>
      </div>
    </Card>
  )
}
