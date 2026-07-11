"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, AlertCircle, CheckCircle, Zap } from "lucide-react"
import { toast } from "sonner"

interface API {
  id: string
  name: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  description: string
  status: "active" | "inactive" | "error"
  rateLimit: string
  lastChecked?: string
}

const AVAILABLE_APIS: API[] = [
  {
    id: "openrouter",
    name: "OpenRouter AI Chat",
    endpoint: "/api/openrouter",
    method: "POST",
    description: "AI-powered chat using OpenRouter models (GPT, Claude, Llama, etc.)",
    status: "active",
    rateLimit: "5 requests/minute",
    lastChecked: new Date().toISOString()
  },
  {
    id: "downloads",
    name: "Download Links",
    endpoint: "/api/downloads",
    method: "GET",
    description: "Fetch and manage movie download/streaming sources",
    status: "active",
    rateLimit: "Unlimited",
    lastChecked: new Date().toISOString()
  },
  {
    id: "livetv",
    name: "Live TV Channels",
    endpoint: "/api/livetv",
    method: "GET",
    description: "Stream live TV channels and sports from IPTV sources",
    status: "active",
    rateLimit: "Unlimited",
    lastChecked: new Date().toISOString()
  },
  {
    id: "ai-chat",
    name: "AI Chat (Internal)",
    endpoint: "/api/ai/chat",
    method: "POST",
    description: "Internal AI chat endpoint with model fallbacks",
    status: "active",
    rateLimit: "Unlimited",
    lastChecked: new Date().toISOString()
  },
  {
    id: "ai-image",
    name: "AI Image Generation",
    endpoint: "/api/ai/image",
    method: "POST",
    description: "Generate images using Google Gemini 2.5 Flash",
    status: "active",
    rateLimit: "Limited by credits",
    lastChecked: new Date().toISOString()
  }
]

export function APIsAdmin() {
  const [testUrl, setTestUrl] = useState("")
  const [testResult, setTestResult] = useState<{ success?: boolean; data?: any; error?: string } | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [selectedAPI, setSelectedAPI] = useState<API | null>(null)

  const handleTestAPI = async (api: API) => {
    if (!api.endpoint) return
    
    setSelectedAPI(api)
    setIsTesting(true)
    setTestResult(null)

    try {
      const url = `http://localhost:3000${api.endpoint}${api.endpoint.includes("?") ? "&" : "?"}test=1`
      const options: RequestInit = {
        method: api.method,
        headers: { "Content-Type": "application/json" }
      }

      if (api.method === "POST") {
        options.body = JSON.stringify({ test: true })
      }

      const res = await fetch(url, options)
      const data = await res.json()

      setTestResult({
        success: res.ok,
        data,
      })
      
      if (res.ok) {
        toast.success(`${api.name} is working!`)
      } else {
        toast.error(`${api.name} error: ${res.status}`)
      }
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : "Test failed"
      })
      toast.error("Test failed")
    } finally {
      setIsTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Zap className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {AVAILABLE_APIS.map((api) => (
          <Card key={api.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(api.status)}
                    {api.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{api.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Endpoint:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-secondary px-2 py-1 rounded">{api.endpoint}</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(api.endpoint)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <Badge variant="outline">{api.method}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rate Limit:</span>
                  <span className="text-sm font-medium">{api.rateLimit}</span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestAPI(api)}
                disabled={isTesting && selectedAPI?.id === api.id}
                className="w-full"
              >
                {isTesting && selectedAPI?.id === api.id ? "Testing..." : "Test API"}
              </Button>

              {selectedAPI?.id === api.id && testResult && (
                <div className={`text-xs p-2 rounded ${testResult.success ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`}>
                  {testResult.error ? (
                    <p>Error: {testResult.error}</p>
                  ) : (
                    <p>Status: {testResult.success ? "✓ Working" : "✗ Error"}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Environment variables and API keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">OPENROUTER_API_KEY</span>
                <Badge variant={process.env.OPENROUTER_API_KEY ? "default" : "destructive"}>
                  {process.env.OPENROUTER_API_KEY ? "✓ Set" : "✗ Missing"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                OpenRouter API key for AI models. Get from https://openrouter.ai
              </p>
            </div>

            <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">APIFY_API_KEY</span>
                <Badge variant={process.env.APIFY_API_KEY ? "default" : "secondary"}>
                  {process.env.APIFY_API_KEY ? "✓ Set" : "Not used"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                Optional: Apify API key for web scraping
              </p>
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            Manage Environment Variables
          </Button>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Examples</CardTitle>
          <CardDescription>Copy-paste ready API examples</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium text-sm">OpenRouter Chat</p>
            <div className="bg-secondary/50 p-3 rounded text-xs font-mono overflow-x-auto">
              <code>
                {'curl -X POST /api/openrouter \\\n-H "Content-Type: application/json" \\\n-d \'{"messages":[{"role":"user","content":"Hello"}]}\''} 
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(`curl -X POST /api/openrouter -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Hello"}]}'`)}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">Download Links</p>
            <div className="bg-secondary/50 p-3 rounded text-xs font-mono overflow-x-auto">
              <code>
                {'curl /api/downloads?movie_id=550'}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard("curl /api/downloads?movie_id=550")}
              >
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
