'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, Trophy, Users, Zap } from 'lucide-react'
import { toast } from 'sonner'

export default function ReferralPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [referrerEmail, setReferrerEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const validateCode = async () => {
      try {
        const response = await fetch('/api/referral/validate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })

        const data = await response.json()

        if (!data.success) {
          setError('Invalid referral code')
        } else {
          setReferrerEmail(data.referrer.email)
        }
      } catch (err) {
        console.error('[v0] Validation error:', err)
        setError('Failed to validate referral code')
      } finally {
        setLoading(false)
      }
    }

    validateCode()

    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        setIsLoggedIn(!!data.user)
      } catch {
        setIsLoggedIn(false)
      }
    }

    checkAuth()
  }, [code])

  const handleSignUp = () => {
    // Store the referral code in sessionStorage
    sessionStorage.setItem('referral_code', code)
    router.push('/auth?tab=signup')
  }

  const handleClaimReward = async () => {
    try {
      const response = await fetch('/api/referral/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_code: code })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`You earned ${data.tokens_awarded} tokens!`)
        setTimeout(() => router.push('/profile'), 2000)
      } else {
        toast.error(data.error || 'Failed to claim reward')
      }
    } catch (error) {
      console.error('[v0] Claim error:', error)
      toast.error('Failed to claim reward')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Validating referral code...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
            <AlertDescription className="text-red-600">✕</AlertDescription>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Invalid Referral Code</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Link href="/">
            <Button className="w-full">Go Home</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">You&apos;re Invited!</h1>
          <p className="text-xl text-muted-foreground">
            Join BMW Community through a friend&apos;s referral
          </p>
        </div>

        {/* Main Card */}
        <Card className="mb-6 p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="space-y-6">
            {/* Referrer Info */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Referred by</p>
              <p className="font-semibold text-lg">{referrerEmail}</p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Connect</p>
                <p className="text-xs text-muted-foreground">With friends</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">100 Tokens</p>
                <p className="text-xs text-muted-foreground">Per signup</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Rewards</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>

            {/* Program Info */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-3">Referral Program Benefits:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Earn 100 tokens per successful referral</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Accumulate tokens for video generation (coming soon)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Unlock exclusive features</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              {!isLoggedIn ? (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleSignUp}
                >
                  <CheckCircle className="w-4 h-4" />
                  Sign Up with Referral
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleClaimReward}
                >
                  <Trophy className="w-4 h-4" />
                  Claim Your Reward
                </Button>
              )}
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full">
                  Explore BMW Community
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Referral Code: <code className="font-mono font-bold">{code}</code></p>
        </div>
      </div>
    </div>
  )
}
