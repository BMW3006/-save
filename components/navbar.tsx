"use client"

import { useState, useEffect } from "react"
import { Menu, Bookmark, Tv, Sun, Moon, Flame, Star, Calendar, User, LogOut, Music, Download, Radio, Sparkles, Code, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useWatchlist } from "@/lib/watchlist"
import { NotificationsPanel } from "@/components/notifications-panel"
import { AuthModal } from "@/components/auth-modal"
import { ProfileModal } from "@/components/profile/profile-modal"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { SearchBar } from "@/components/search-bar"
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
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const { watchlist } = useWatchlist()

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchProfile()
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile/fetch')
      const data = await res.json()
      if (res.ok) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('[v0] Fetch profile error:', error)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  const categories = [
    { id: "trending", label: "Trending", icon: Flame },
    { id: "top_rated", label: "Top Rated", icon: Star },
    { id: "upcoming", label: "Upcoming", icon: Calendar },
    { id: "tv", label: "TV Series", icon: Tv },
    { id: "livetv", label: "Live TV", icon: Radio },
    { id: "music", label: "Music", icon: Music },
    { id: "download", label: "Download", icon: Download },
    { id: "football", label: "Football", icon: Trophy },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-baseline gap-0.5 shrink-0 min-w-fit" onClick={() => onCategoryChange("trending")}>
              <span className="text-sm sm:text-lg font-bold text-foreground">NADHILI</span>
              <span className="text-base sm:text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">_DB</span>
            </Link>

            {/* Search - Desktop */}
            <div className="hidden sm:flex flex-1 max-w-md">
              <SearchBar 
                onSearch={onSearch}
                showAutocomplete={true}
              />
            </div>

            {/* Mobile Search Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden h-9 w-9"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="mt-6">
                  <SearchBar 
                    onSearch={(query) => {
                      onSearch(query)
                    }}
                    showAutocomplete={true}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* API Docs Link */}
              <Link href="/api-docs">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                  title="API Documentation"
                >
                  <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                {isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>

              {/* Notifications */}
              <NotificationsPanel />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCategoryChange("watchlist")}
                className="relative h-9 w-9 sm:h-10 sm:w-10"
              >
                <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
                {watchlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {watchlist.length > 9 ? "9+" : watchlist.length}
                  </span>
                )}
              </Button>

              {/* User Account */}
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowProfileModal(true)}
                    title="Profile"
                    className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/10"
                  >
                    <ProfileAvatar
                      avatarUrl={profile?.avatar_url}
                      displayName={profile?.display_name}
                      size="sm"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Logout"
                    className="h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAuthModal(true)}
                  title="Login / Sign Up"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Category Bar - Show all 8 categories */}
      <div className="fixed top-14 sm:top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={currentCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(cat.id)}
                className="gap-1 sm:gap-1.5 whitespace-nowrap text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
              >
                <cat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{cat.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          fetchProfile()
        }}
        profile={profile}
      />
    </>
  )
}
