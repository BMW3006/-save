'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function TopScorers() {
  const [scorers, setScorers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopScorers()
  }, [])

  const fetchTopScorers = async () => {
    try {
      const response = await fetch('/api/football/topscorers?league=1&season=2026')
      const data = await response.json()

      if (data.success) {
        const scorers = Array.isArray(data.data) ? data.data : data.data?.topscorers || []
        setScorers(scorers)
      } else {
        setError(data.error || 'Failed to fetch top scorers')
      }
    } catch (err) {
      console.error('[v0] Error fetching top scorers:', err)
      setError('Could not connect to top scorers')
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

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Goals</TableHead>
              <TableHead className="text-center">Matches</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scorers.map((player, idx) => (
              <TableRow key={player.id || idx}>
                <TableCell>
                  <Badge variant="outline">{idx + 1}</Badge>
                </TableCell>
                <TableCell className="font-medium">{player.name || player.player}</TableCell>
                <TableCell>{player.team}</TableCell>
                <TableCell className="text-center font-bold text-lg">
                  {player.goals || player.goals_scored}
                </TableCell>
                <TableCell className="text-center">{player.matches || player.appearances}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
