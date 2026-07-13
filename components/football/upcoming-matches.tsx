'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MatchCard } from './match-card'

export function UpcomingMatches() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUpcomingMatches()
  }, [])

  const fetchUpcomingMatches = async () => {
    try {
      const response = await fetch('/api/football/upcoming')
      const data = await response.json()

      if (data.success) {
        const matches = Array.isArray(data.data) ? data.data : data.data?.matches || []
        setMatches(matches)
      } else {
        setError(data.error || 'Failed to fetch upcoming matches')
      }
    } catch (err) {
      console.error('[v0] Error fetching upcoming matches:', err)
      setError('Could not connect to upcoming matches')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No upcoming matches scheduled</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          id={match.id}
          homeTeam={match.homeTeam?.name || match.home_team}
          awayTeam={match.awayTeam?.name || match.away_team}
          status="upcoming"
          time={match.kickoff_time || match.time}
          league={match.league?.name || match.league}
          stadium={match.stadium}
        />
      ))}
    </div>
  )
}
