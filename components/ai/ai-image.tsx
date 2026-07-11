"use client"

import { useState } from "react"
import { ImageIcon, Loader2, Download, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const EXAMPLE_PROMPTS = [
  "A futuristic cinema hall with neon lights",
  "A movie poster for a space adventure film",
  "Cozy home theater setup at night",
  "Retro film camera on a wooden desk",
]

export function AiImage() {
  const [prompt, setPrompt] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setImageUrl(null)

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const data = await res.json()

      if (data.imageUrl) {
        setImageUrl(data.imageUrl)
      } else {
        setError(data.error || "Failed to generate image")
      }
    } catch (err) {
      console.error("[v0] Image generation error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = () => {
    if (!imageUrl) return
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `nadhili-ai-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Describe your image
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic landscape with dramatic lighting..."
            className="bg-secondary border-border min-h-32 resize-none"
          />
          <Button
            onClick={generateImage}
            disabled={isLoading || !prompt.trim()}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>
        </div>

        {/* Example prompts */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Try these prompts:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i}
                onClick={() => setPrompt(ex)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-center min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Creating your image...</p>
            <p className="text-xs text-muted-foreground">This may take a few seconds</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm font-medium text-foreground">{error}</p>
          </div>
        ) : imageUrl ? (
          <div className="w-full space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={prompt}
              className="w-full rounded-xl"
            />
            <Button onClick={downloadImage} variant="secondary" className="w-full gap-2">
              <Download className="h-4 w-4" />
              Download Image
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
              <ImageIcon className="h-8 w-8" />
            </div>
            <p className="text-sm">Your generated image will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
