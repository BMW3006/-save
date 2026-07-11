"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Code2, BookOpen, Zap } from "lucide-react"
import { toast } from "sonner"

export default function APIDocs() {
  const [copied, setCopied] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState("Hello, what is BMW Community?")
  const [testResponse, setTestResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const testAPI = async () => {
    setIsLoading(true)
    setTestResponse("")
    
    try {
      const res = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: testMessage }],
          model: "meta-llama/llama-3.3-70b-instruct:free"
        })
      })
      
      const data = await res.json()
      setTestResponse(data.message || data.error || "No response")
    } catch (error) {
      setTestResponse("Error: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const examples = [
    {
      id: "quick-query",
      title: "Quick Query (GET)",
      url: "/api/openrouter?q=hello",
      code: `curl "/api/openrouter?q=hello"`
    },
    {
      id: "chat-post",
      title: "Chat Endpoint (POST)",
      url: "/api/openrouter",
      code: `curl -X POST /api/openrouter \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "meta-llama/llama-3.3-70b-instruct:free"
  }'`
    },
    {
      id: "download-get",
      title: "Download Links (GET)",
      url: "/api/downloads?movie_id=550&title=Fight%20Club",
      code: `curl "/api/downloads?movie_id=550&title=Fight%20Club"`
    },
    {
      id: "download-post",
      title: "Add Download (POST - Admin)",
      url: "/api/downloads",
      code: `curl -X POST /api/downloads \\
  -H "Content-Type: application/json" \\
  -d '{
    "movie_id": 550,
    "movie_title": "Fight Club",
    "source_name": "YTS",
    "source_type": "torrent",
    "quality": "720p",
    "url": "magnet:?xt=urn:btih:...",
    "file_size": "750MB"
  }'`
    },
    {
      id: "status",
      title: "Status Check",
      url: "/api/openrouter?status=1",
      code: `curl "/api/openrouter?status=1"`
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Code2 className="h-8 w-8" />
            <h1 className="text-4xl font-bold">BMW Community API</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            OpenRouter-powered AI API with rate limiting and CORS enabled
          </p>
        </div>

        {/* Quick Start */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-mono text-sm mb-2">Base URL:</p>
              <div className="flex gap-2 items-center bg-secondary p-3 rounded-lg">
                <code className="text-sm flex-1">{typeof window !== "undefined" ? window.location.origin : ""}/api/openrouter</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(
                    typeof window !== "undefined" ? window.location.origin + "/api/openrouter" : "",
                    "base-url"
                  )}
                >
                  {copied === "base-url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Rate Limit: 5 requests per minute per IP</p>
              <p className="text-sm text-muted-foreground">CORS: Enabled for all origins</p>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {examples.map((example) => (
              <div key={example.id} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">{example.title}</h4>
                <div className="flex gap-2 items-center bg-secondary p-2 rounded text-xs font-mono">
                  <code className="flex-1 break-all">{example.url}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(example.url, example.id)}
                  >
                    {copied === example.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="bg-secondary p-3 rounded text-xs font-mono overflow-x-auto">
                  <pre>{example.code}</pre>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* API Tester */}
        <Card>
          <CardHeader>
            <CardTitle>Test API</CardTitle>
            <CardDescription>Try the API right here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter your message..."
                className="mt-1 min-h-24"
              />
            </div>
            
            <Button onClick={testAPI} disabled={isLoading} className="w-full">
              {isLoading ? "Loading..." : "Send Request"}
            </Button>
            
            {testResponse && (
              <div>
                <label className="text-sm font-medium">Response</label>
                <div className="mt-1 p-3 bg-secondary rounded-lg text-sm whitespace-pre-wrap break-words">
                  {testResponse}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Models */}
        <Card>
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-secondary rounded text-sm">meta-llama/llama-3.3-70b-instruct:free</div>
              <div className="p-2 bg-secondary rounded text-sm">meta-llama/llama-3.2-3b-instruct:free</div>
              <div className="p-2 bg-secondary rounded text-sm">google/gemini-2.5-flash-image</div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 text-sm text-muted-foreground border-t">
          <p>BMW Community API v1.0</p>
          <p>Powered by OpenRouter</p>
        </div>
      </div>
    </div>
  )
}
