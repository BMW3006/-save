"use client"

import { useState } from "react"
import {
  Share2,
  Copy,
  MessageCircle,
  Facebook,
  Twitter,
  Send,
  Check,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  generateShareLinks,
  copyToClipboard,
  SUPPORT_WHATSAPP,
} from "@/lib/share"
import { toast } from "sonner"

interface ShareButtonProps {
  title: string
  description?: string
  url: string
  type?: 'movie' | 'song' | 'general'
  showFeedback?: boolean
}

export function ShareButton({
  title,
  description,
  url,
  type = 'general',
  showFeedback = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareLinks = generateShareLinks({
    title,
    description,
    url,
    type,
  })

  const handleCopy = async () => {
    try {
      await copyToClipboard(shareLinks.copy)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleShare = (platform: string, link: string) => {
    window.open(link, '_blank', 'width=600,height=400')
  }

  const handleFeedback = () => {
    window.open(SUPPORT_WHATSAPP, '_blank')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-semibold">Share {type}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
        </div>
        <DropdownMenuSeparator />

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </div>
        </DropdownMenuItem>

        {/* WhatsApp */}
        <DropdownMenuItem
          onClick={() => handleShare('whatsapp', shareLinks.whatsapp)}
          className="cursor-pointer"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          <span>Share on WhatsApp</span>
        </DropdownMenuItem>

        {/* Facebook */}
        <DropdownMenuItem
          onClick={() => handleShare('facebook', shareLinks.facebook)}
          className="cursor-pointer"
        >
          <Facebook className="h-4 w-4 mr-2" />
          <span>Share on Facebook</span>
        </DropdownMenuItem>

        {/* Twitter */}
        <DropdownMenuItem
          onClick={() => handleShare('twitter', shareLinks.twitter)}
          className="cursor-pointer"
        >
          <Twitter className="h-4 w-4 mr-2" />
          <span>Share on Twitter</span>
        </DropdownMenuItem>

        {/* Telegram */}
        <DropdownMenuItem
          onClick={() => handleShare('telegram', shareLinks.telegram)}
          className="cursor-pointer"
        >
          <Send className="h-4 w-4 mr-2" />
          <span>Share on Telegram</span>
        </DropdownMenuItem>

        {showFeedback && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleFeedback} className="cursor-pointer">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>Feedback & Support</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
