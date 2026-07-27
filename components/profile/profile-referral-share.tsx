'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Share2, Loader2, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ReferralInfo {
  referral_code: string
  referral_url: string
  display_name: string
  share_message: string
}

export function ProfileReferralShare() {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralInfo()
  }, [])

  const fetchReferralInfo = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/profile/referral-link')
      const data = await res.json()

      if (res.ok) {
        setReferralInfo(data)
      }
    } catch (error) {
      console.error('[v0] Fetch referral info error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (referralInfo?.referral_url) {
      navigator.clipboard.writeText(referralInfo.referral_url)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareOnSocial = (platform: string) => {
    if (!referralInfo) return

    const text = encodeURIComponent(referralInfo.share_message)
    const url = encodeURIComponent(referralInfo.referral_url)

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      email: `mailto:?subject=Join BMW Community&body=${text}`,
    }

    window.open(urls[platform], '_blank')
  }

  if (isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading referral link...</span>
      </Card>
    )
  }

  if (!referralInfo) return null

  return (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="font-semibold">Share Your Referral Link</p>
          <p className="text-xs text-muted-foreground">Earn 100 tokens per successful referral</p>
        </div>
      </div>

      {/* Reference Code */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Your Code</p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={referralInfo.referral_code}
            readOnly
            className="font-mono text-center"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Share Link</p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={referralInfo.referral_url}
            readOnly
            className="text-xs"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Share Buttons */}
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full gap-2" variant="default">
              <Share2 className="h-4 w-4" />
              Share on Social Media
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => shareOnSocial('whatsapp')}>
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => shareOnSocial('facebook')}>
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => shareOnSocial('twitter')}>
              Twitter/X
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => shareOnSocial('telegram')}>
              Telegram
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => shareOnSocial('email')}>
              Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
