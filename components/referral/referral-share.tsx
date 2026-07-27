'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MessageCircle, Facebook, Twitter, Send, Link, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface ReferralShareProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  referralCode: string
  shareUrl: string
}

export function ReferralShare({ open, onOpenChange, referralCode, shareUrl }: ReferralShareProps) {
  const message = `Join me on BMW Community! Use my referral code: ${referralCode} and earn 100 tokens!`
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedMessage = encodeURIComponent(message)

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
    email: `mailto:?subject=Join BMW Community&body=${encodedMessage}`,
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Referral Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Code Display */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Reference Code:</p>
            <code className="text-lg font-bold">{referralCode}</code>
          </div>

          {/* Message Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Share Message:</p>
            <p className="text-sm">{message}</p>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(shareLinks.whatsapp, '_blank')}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(shareLinks.facebook, '_blank')}
              className="gap-2"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(shareLinks.twitter, '_blank')}
              className="gap-2"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(shareLinks.telegram, '_blank')}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Telegram
            </Button>
          </div>

          {/* Copy Link */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={copyLink}
          >
            <Link className="w-4 h-4" />
            Copy Link
          </Button>

          {/* Email */}
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={() => window.open(shareLinks.email)}
          >
            <Mail className="w-4 h-4" />
            Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
