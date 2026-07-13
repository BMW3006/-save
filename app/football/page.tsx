'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap, TrendingUp, Users, Radio, Trophy, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LiveMatches } from '@/components/football/live-matches'
import { UpcomingMatches } from '@/components/football/upcoming-matches'
import { Standings } from '@/components/football/standings'
import { TopScorers } from '@/components/football/top-scorers'
import { TopAssists } from '@/components/football/top-assists'

export default function FootballPage() {
  const [activeTab, setActiveTab] = useState('live')

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Football</h1>
              <p className="text-muted-foreground">Live matches, standings & statistics</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Live Now</span>
            </div>
            <p className="text-2xl font-bold">Live</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Upcoming</span>
            </div>
            <p className="text-2xl font-bold">Scheduled</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Top Scorers</span>
            </div>
            <p className="text-2xl font-bold">Stats</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Top Assists</span>
            </div>
            <p className="text-2xl font-bold">Assists</p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="live" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Live</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="standings" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </TabsTrigger>
            <TabsTrigger value="scorers" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="assists" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Assists</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-red-500 animate-pulse" />
                <p className="text-sm font-medium">Watch live matches in real-time</p>
              </div>
            </div>
            <LiveMatches />
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">Upcoming matches and fixtures</p>
              </div>
            </div>
            <UpcomingMatches />
          </TabsContent>

          <TabsContent value="standings" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <p className="text-sm font-medium">League table and standings</p>
              </div>
            </div>
            <Standings />
          </TabsContent>

          <TabsContent value="scorers" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium">Top scorers in the league</p>
              </div>
            </div>
            <TopScorers />
          </TabsContent>

          <TabsContent value="assists" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <p className="text-sm font-medium">Top assist makers in the league</p>
              </div>
            </div>
            <TopAssists />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
