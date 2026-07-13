import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Radio } from 'lucide-react'

interface MatchCardProps {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  status: 'live' | 'upcoming' | 'finished'
  time?: string
  league?: string
  stadium?: string
  streams?: boolean
}

export function MatchCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  time,
  league,
  stadium,
  streams,
}: MatchCardProps) {
  const isLive = status === 'live'
  const isFinished = status === 'finished'

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {league && <p className="text-xs text-muted-foreground mb-1">{league}</p>}
            {time && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {time}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isLive && (
              <Badge className="bg-red-500 animate-pulse gap-1">
                <Radio className="w-3 h-3" />
                LIVE
              </Badge>
            )}
            {isFinished && <Badge variant="outline">FINISHED</Badge>}
            {status === 'upcoming' && <Badge variant="secondary">UPCOMING</Badge>}
          </div>
        </div>

        {/* Match Score */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold truncate">{homeTeam}</p>
          </div>
          <div className="px-3 py-1 mx-2">
            {homeScore !== undefined && awayScore !== undefined ? (
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {homeScore} - {awayScore}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">vs</p>
            )}
          </div>
          <div className="flex-1 text-right">
            <p className="font-semibold truncate">{awayTeam}</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-2">
          {stadium && <span className="truncate">{stadium}</span>}
          {streams && (
            <div className="flex items-center gap-1 text-primary">
              <Radio className="w-3 h-3" />
              <span>Stream</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
