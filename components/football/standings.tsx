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

export function Standings() {
  const [standings, setStandings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStandings()
  }, [])

  const fetchStandings = async () => {
    try {
      const response = await fetch('/api/football/standings?league=1&season=2026')
      const data = await response.json()

      if (data.success) {
        const standings = Array.isArray(data.data) ? data.data : data.data?.standings || []
        setStandings(standings)
      } else {
        setError(data.error || 'Failed to fetch standings')
      }
    } catch (err) {
      console.error('[v0] Error fetching standings:', err)
      setError('Could not connect to standings')
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
              <TableHead className="w-12">Pos</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GF</TableHead>
              <TableHead className="text-center">GA</TableHead>
              <TableHead className="text-center">GD</TableHead>
              <TableHead className="text-right">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((team, idx) => (
              <TableRow key={team.id || idx}>
                <TableCell className="font-semibold">{idx + 1}</TableCell>
                <TableCell className="font-medium">{team.name || team.team}</TableCell>
                <TableCell className="text-center">{team.played || team.p}</TableCell>
                <TableCell className="text-center text-green-600">{team.won || team.w}</TableCell>
                <TableCell className="text-center text-yellow-600">{team.draw || team.d}</TableCell>
                <TableCell className="text-center text-red-600">{team.lost || team.l}</TableCell>
                <TableCell className="text-center">{team.goalsFor || team.gf}</TableCell>
                <TableCell className="text-center">{team.goalsAgainst || team.ga}</TableCell>
                <TableCell className="text-center">{team.goalDifference || team.gd}</TableCell>
                <TableCell className="text-right font-bold">{team.points || team.pts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
