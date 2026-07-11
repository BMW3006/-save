"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Download {
  id: string
  movie_id: number | null
  movie_title: string
  source_name: string
  source_type: 'torrent' | 'streaming' | 'direct'
  quality: string
  url: string
  file_size: string | null
  seeders: number | null
}

export function DownloadsAdmin() {
  const [downloads, setDownloads] = useState<Download[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    movie_title: "",
    source_name: "",
    source_type: "torrent" as const,
    quality: "720p",
    url: "",
    file_size: "",
  })

  useEffect(() => {
    fetchDownloads()
  }, [])

  const fetchDownloads = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/downloads")
      const data = await res.json()
      setDownloads(data.downloads || [])
    } catch (error) {
      console.error("[v0] Fetch error:", error)
      toast.error("Failed to load downloads")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url.trim() || !formData.source_name.trim() || !formData.movie_title.trim()) {
      toast.error("Fill all required fields")
      return
    }

    try {
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to add")
      const data = await res.json()
      setDownloads([...downloads, data.download])
      resetForm()
      toast.success("Download added!")
    } catch (error) {
      console.error("[v0] Add error:", error)
      toast.error("Failed to add download")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this download?")) return

    try {
      const res = await fetch(`/api/downloads?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setDownloads(downloads.filter(d => d.id !== id))
      toast.success("Deleted!")
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast.error("Delete failed")
    }
  }

  const resetForm = () => {
    setFormData({
      movie_title: "",
      source_name: "",
      source_type: "torrent",
      quality: "720p",
      url: "",
      file_size: "",
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-foreground">Manage Downloads</h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-secondary/50 p-4 rounded-xl border border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Movie Title"
              value={formData.movie_title}
              onChange={(e) => setFormData({ ...formData, movie_title: e.target.value })}
              required
            />
            <Input
              placeholder="Source"
              value={formData.source_name}
              onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={formData.source_type}
              onChange={(e) => setFormData({ ...formData, source_type: e.target.value as any })}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="torrent">Torrent</option>
              <option value="streaming">Streaming</option>
              <option value="direct">Direct</option>
            </select>
            <Input
              placeholder="Quality"
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
            />
          </div>
          <Input
            placeholder="URL/Magnet"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
          />
          <Input
            placeholder="File Size"
            value={formData.file_size}
            onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Save</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : downloads.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No downloads yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {downloads.map((dl) => (
            <div key={dl.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{dl.movie_title}</p>
                <p className="text-xs text-muted-foreground">
                  {dl.source_name} • {dl.quality} • {dl.source_type}
                </p>
              </div>
              <button
                onClick={() => handleDelete(dl.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
