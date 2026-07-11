"use client"

import { useState, useEffect } from "react"
import { Search, Menu, Bookmark, Tv, Sun, Moon, Flame, Star, Calendar, User, LogOut, Music, Download, Radio, Sparkles, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useWatchlist } from "@/lib/watchlist"
import { NotificationsPanel } from "@/components/notifications-panel"
import { AuthModal } from "@/components/auth-modal"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import Link from "next/link"

interface NavbarProps {
  onSearch: (query: string) => void
  onCategoryChange: (category: string) => void
  currentCategory: string
  isDark: boolean
  onToggleTheme: () => void
}

export function Navbar({ onSearch, onCategoryChange, currentCategory, isDark, onToggleTheme }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const { watchlist } = useWatchlist()

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const categories = [
    { id: "trending", label: "Trending", icon: Flame },
    { id: "top_rated", label: "Top Rated", icon: Star },
    { id: "upcoming", label: "Upcoming", icon: Calendar },
    { id: "tv", label: "TV Series", icon: Tv },
    { id: "livetv", label: "Live TV", icon: Radio },
    { id: "music", label: "Music", icon: Music },
    { id: "download", label: "Download", icon: Download },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-0.5 shrink-0" onClick={() => onCategoryChange("trending")}>
            <span className="text-lg font-bold text-foreground">NADHILI</span>
            <span className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">_DB</span>
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search movies & TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-secondary border-border rounded-full"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={currentCategory === cat.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onCategoryChange(cat.id)}
                className="gap-1.5"
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Music Search Link */}
            <Link href="/music" className="hidden sm:block">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
              >
                <Music className="h-4 w-4" />
                Music
              </Button>
            </Link>

            {/* AI Link */}
            <Link href="/ai" className="hidden sm:block">
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                AI
              </Button>
            </Link>

            {/* API Docs Link */}
            <Link href="/api-docs">
              <Button
                size="icon"
                variant="ghost"
                className="sm:size-auto sm:px-3"
                title="API Documentation"
              >
                <Code className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1.5">API</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              className="hidden sm:flex"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <NotificationsPanel />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCategoryChange("watchlist")}
              className="relative"
            >
              <Bookmark className="h-5 w-5" />
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </Button>

            {/* User Account */}
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAuthModal(true)}
                title="Login / Sign Up"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Auth Modal */}
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              onSuccess={() => setShowAuthModal(false)}
            />

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="md:hidden">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-secondary"
                      />
                    </div>
                  </form>

                  {/* Mobile Categories */}
                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={currentCategory === cat.id ? "default" : "ghost"}
                        className="justify-start gap-3"
                        onClick={() => {
                          onCategoryChange(cat.id)
                          setIsOpen(false)
                        }}
                      >
                        <cat.icon className="h-5 w-5" />
                        {cat.label}
                      </Button>
                    ))}
                  </div>

                  {/* Music Search Mobile */}
                  <Link href="/music" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Music className="h-5 w-5" />
                      Music Search
                    </Button>
                  </Link>

                  {/* AI Link Mobile */}
                  <Link href="/ai" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-start gap-3 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      <Sparkles className="h-5 w-5" />
                      BMW AI
                    </Button>
                  </Link>

                  {/* API Link Mobile */}
                  <Link href="/api-docs" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Code className="h-5 w-5" />
                      API Docs
                    </Button>
                  </Link>

                  {/* Theme Toggle Mobile */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      onToggleTheme()
                      setIsOpen(false)
                    }}
                    className="justify-start gap-3"
                  >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
