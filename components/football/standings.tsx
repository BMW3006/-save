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

      if (data.success && data.data) {
        // Handle nested standings structure from World Cup groups
        let allTeams: any[] = []
        
        if (Array.isArray(data.data)) {
          data.data.forEach((league: any) => {
            if (league.standings && Array.isArray(league.standings)) {
              league.standings.forEach((group: any) => {
                if (Array.isArray(group)) {
                  allTeams = allTeams.concat(group)
                }
              })
            }
          })
        }
        
        setStandings(allTeams.length > 0 ? allTeams : [])
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

  if (standings.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No standings data available</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <Card className="hidden md:block">
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
            {standings.map((standing, idx) => {
              const teamName = standing.team?.name || standing.name || 'Unknown'
              const rank = standing.rank || idx + 1
              const played = standing.played || standing.p || 0
              const won = standing.win || standing.w || 0
              const draw = standing.draw || standing.d || 0
              const lost = standing.lose || standing.l || 0
              const gf = standing.gf || 0
              const ga = standing.ga || 0
              const gd = standing.gd || 0
              const points = standing.points || standing.pts || 0

              return (
                <TableRow key={`${standing.team?.id || idx}-${teamName}`}>
                  <TableCell className="font-semibold">{rank}</TableCell>
                  <TableCell className="font-medium">{teamName}</TableCell>
                  <TableCell className="text-center">{played}</TableCell>
                  <TableCell className="text-center text-green-600">{won}</TableCell>
                  <TableCell className="text-center text-yellow-600">{draw}</TableCell>
                  <TableCell className="text-center text-red-600">{lost}</TableCell>
                  <TableCell className="text-center">{gf}</TableCell>
                  <TableCell className="text-center">{ga}</TableCell>
                  <TableCell className="text-center">{gd}</TableCell>
                  <TableCell className="text-right font-bold">{points}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
          </div>
        </Card>
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {standings.map((standing, idx) => {
          const teamName = standing.team?.name || standing.name || 'Unknown'
          const teamLogo = standing.team?.logo
          const rank = standing.rank || idx + 1
          const played = standing.played || 0
          const points = standing.points || 0
          const gd = standing.gd || 0

          return (
            <Card key={`mobile-${rank}-${teamName}`} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-lg font-bold text-primary w-8 text-center">{rank}</div>
                  {teamLogo && (
                    <img src={teamLogo} alt={teamName} className="h-8 w-8 rounded object-contain" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm">{teamName}</p>
                    <p className="text-xs text-muted-foreground">{played} matches</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{points}</p>
                  <p className={`text-xs ${gd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gd > 0 ? '+' : ''}{gd}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
