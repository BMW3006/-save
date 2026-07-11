"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Send,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Film,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { searchMovies, getImageUrl, type Movie } from "@/lib/tmdb"
import { DownloadsAdmin } from "@/components/admin/downloads-admin"
import { APIsAdmin } from "@/components/admin/apis-admin"
import { CustomAPIManager } from "@/components/admin/custom-api-manager"

const ADMIN_PASSWORD = "3006"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  movie_id?: number
  movie_title?: string
  movie_poster?: string
  is_active: boolean
  created_at: string
}

const typeIcons: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  movie: Film,
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("info")
  const [movieSearch, setMovieSearch] = useState("")
  const [movieResults, setMovieResults] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const stored = sessionStorage.getItem("nadhili_admin_auth")
    if (stored === "true") {
      setIsAuthenticated(true)
      fetchNotifications()
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem("nadhili_admin_auth", "true")
      fetchNotifications()
      toast.success("Welcome, Admin!")
    } else {
      toast.error("Invalid password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("nadhili_admin_auth")
    router.push("/")
  }

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.log("[v0] Error fetching notifications:", error)
      } else {
        setNotifications(data || [])
      }
    } catch (err) {
      console.log("[v0] Fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchMovie = async () => {
    if (!movieSearch.trim()) return
    setIsSearching(true)
    try {
      const results = await searchMovies(movieSearch)
      setMovieResults(results.slice(0, 5))
    } catch {
      toast.error("Failed to search movies")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie)
    setMovieResults([])
    setMovieSearch("")
    setType("movie")
    if (!title) {
      setTitle(`New Movie Alert: ${movie.title}`)
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in title and message")
      return
    }

    setIsSending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("notifications").insert({
        title,
        message,
        type,
        movie_id: selectedMovie?.id || null,
        movie_title: selectedMovie?.title || null,
        movie_poster: selectedMovie?.poster_path || null,
        is_active: true,
      })

      if (error) {
        console.log("[v0] Insert error:", error)
        toast.error("Failed to send notification")
      } else {
        toast.success("Notification sent!")
        setTitle("")
        setMessage("")
        setType("info")
        setSelectedMovie(null)
        fetchNotifications()
      }
    } catch (err) {
      console.log("[v0] Send error:", err)
      toast.error("Something went wrong")
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)

      if (error) {
        toast.error("Failed to delete")
      } else {
        toast.success("Notification deleted")
        fetchNotifications()
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("notifications")
        .update({ is_active: !currentStatus })
        .eq("id", id)

      if (error) {
        toast.error("Failed to update")
      } else {
        toast.success(currentStatus ? "Notification hidden" : "Notification activated")
        fetchNotifications()
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <CardDescription>
              Enter the admin password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                BMW Community Admin
              </h1>
              <p className="text-sm text-muted-foreground">Manage notifications, downloads & APIs</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Send Notification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Send New Notification
              </CardTitle>
              <CardDescription>
                Create and send notifications to all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="movie">Movie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your notification message..."
                    rows={3}
                  />
                </div>

                {/* Movie Search */}
                <div className="space-y-2">
                  <Label>Attach Movie (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={movieSearch}
                      onChange={(e) => setMovieSearch(e.target.value)}
                      placeholder="Search for a movie..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchMovie())}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSearchMovie}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Movie Results */}
                  {movieResults.length > 0 && (
                    <div className="mt-2 space-y-2 rounded-lg border p-2">
                      {movieResults.map((movie) => (
                        <button
                          key={movie.id}
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-secondary"
                          onClick={() => handleSelectMovie(movie)}
                        >
                          {movie.poster_path ? (
                            <img
                              src={getImageUrl(movie.poster_path, "w92")}
                              alt={movie.title}
                              className="h-12 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-8 items-center justify-center rounded bg-secondary">
                              <Film className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{movie.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {movie.release_date?.slice(0, 4)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Movie */}
                  {selectedMovie && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2">
                      {selectedMovie.poster_path && (
                        <img
                          src={getImageUrl(selectedMovie.poster_path, "w92")}
                          alt={selectedMovie.title}
                          className="h-16 w-11 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{selectedMovie.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedMovie.release_date?.slice(0, 4)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMovie(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSending}>
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Notification
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Sent Notifications
              </CardTitle>
              <CardDescription>
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
                  {notifications.map((notif) => {
                    const Icon = typeIcons[notif.type] || Info
                    return (
                      <div
                        key={notif.id}
                        className={`rounded-lg border p-3 ${
                          notif.is_active ? "border-border" : "border-border/50 opacity-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{notif.title}</p>
                              <Badge variant={notif.is_active ? "default" : "secondary"} className="shrink-0">
                                {notif.is_active ? "Active" : "Hidden"}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {notif.message}
                            </p>
                            {notif.movie_title && (
                              <p className="mt-1 text-xs text-accent">
                                Movie: {notif.movie_title}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground/70">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(notif.id, notif.is_active)}
                            >
                              {notif.is_active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notif.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Downloads Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-primary" />
                Download Links
              </CardTitle>
              <CardDescription>
                Manage movie download and streaming sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DownloadsAdmin />
            </CardContent>
          </Card>
        </div>

        {/* APIs Management - Full Width */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                API Management
              </CardTitle>
              <CardDescription>
                Monitor and manage all available APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <APIsAdmin />
            </CardContent>
          </Card>
        </div>

        {/* Custom APIs Management - Full Width */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Custom APIs
              </CardTitle>
              <CardDescription>
                Add and manage custom API integrations for your services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomAPIManager />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
