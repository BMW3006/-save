'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ReferralInputProps {
  onCodeValidated?: (code: string) => void
  placeholder?: string
}

export function ReferralInput({ onCodeValidated, placeholder = 'Enter referral code' }: ReferralInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const [error, setError] = useState('')
  const [referrerEmail, setReferrerEmail] = useState('')

  const validateCode = async () => {
    if (!code.trim()) {
      setError('Please enter a code')
      return
    }

    setLoading(true)
    setError('')
    setValidated(false)

    try {
      const response = await fetch('/api/referral/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Invalid code')
        setValidated(false)
        return
      }

      setValidated(true)
      setReferrerEmail(data.referrer.email)
      toast.success('Code validated!')
      onCodeValidated?.(code.toUpperCase())
    } catch (error) {
      console.error('[v0] Validation error:', error)
      setError('Failed to validate code')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateCode()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError('')
            setValidated(false)
          }}
          onKeyPress={handleKeyPress}
          disabled={loading || validated}
          className="font-mono"
        />
        <Button
          onClick={validateCode}
          disabled={loading || validated || !code.trim()}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : validated ? (
            <CheckCircle className="w-4 h-4" />
          ) : null}
          {loading ? 'Validating...' : validated ? 'Valid' : 'Validate'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {validated && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Code valid! Referred by {referrerEmail}. You'll earn rewards when you sign up.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
