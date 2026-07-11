"use client"

import { useState, useEffect } from "react"
import { Bell, X, Film, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "movie"
  movie_id?: number
  movie_title?: string
  movie_poster?: string
  is_active: boolean
  created_at: string
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  movie: Film,
}

const typeColors = {
  info: "text-blue-500 bg-blue-500/10",
  success: "text-green-500 bg-green-500/10",
  warning: "text-yellow-500 bg-yellow-500/10",
  error: "text-red-500 bg-red-500/10",
  movie: "text-primary bg-primary/10",
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load read notifications from localStorage
    const stored = localStorage.getItem("nadhili_read_notifications")
    if (stored) {
      setReadIds(new Set(JSON.parse(stored)))
    }
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20)

      if (!error && data) {
        setNotifications(data)
      }
    }

    fetchNotifications()

    // Subscribe to realtime updates
    const supabase = createClient()
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const markAsRead = (id: string) => {
    const newReadIds = new Set(readIds)
    newReadIds.add(id)
    setReadIds(newReadIds)
    localStorage.setItem("nadhili_read_notifications", JSON.stringify([...newReadIds]))
  }

  const markAllAsRead = () => {
    const newReadIds = new Set(notifications.map((n) => n.id))
    setReadIds(newReadIds)
    localStorage.setItem("nadhili_read_notifications", JSON.stringify([...newReadIds]))
  }

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground/70">
                Check back later for updates
              </p>
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Info
                const isRead = readIds.has(notification.id)

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative rounded-lg border p-4 transition-colors",
                      isRead
                        ? "border-border bg-background"
                        : "border-primary/30 bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {!isRead && (
                      <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
                    )}

                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          typeColors[notification.type]
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <p className="font-semibold leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>

                        {notification.movie_poster && (
                          <div className="mt-2 flex items-center gap-2 rounded-md bg-secondary/50 p-2">
                            <img
                              src={`https://image.tmdb.org/t/p/w92${notification.movie_poster}`}
                              alt={notification.movie_title || "Movie"}
                              className="h-16 w-11 rounded object-cover"
                            />
                            <span className="text-sm font-medium">
                              {notification.movie_title}
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground/70">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
