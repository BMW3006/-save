"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MessageSquare, Code2, ImageIcon, Sparkles, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AiChat } from "@/components/ai/ai-chat"
import { AiImage } from "@/components/ai/ai-image"
import { GroqChat } from "@/components/groq-chat"

type Tool = "chat" | "code" | "image" | "music"

const TOOLS = [
  { id: "chat" as Tool, label: "AI Chat", icon: MessageSquare, desc: "Chat with AI assistant" },
  { id: "code" as Tool, label: "Code Generator", icon: Code2, desc: "Generate code instantly" },
  { id: "image" as Tool, label: "Image Generator", icon: ImageIcon, desc: "Create AI images" },
  { id: "music" as Tool, label: "Music AI", icon: Music, desc: "Chat about music with Groq AI" },
]

export default function AiPage() {
  const [activeTool, setActiveTool] = useState<Tool>("chat")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:font-bold sm:text-foreground font-semibold leading-tight truncate">NADHILI AI</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Powered by OpenRouter</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-balance">
            AI Tools for Everyone
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto text-pretty">
            Chat, generate code, and create stunning images — all powered by advanced AI models.
          </p>
        </div>

        {/* Tool Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-2xl border transition-all text-center sm:text-left ${
                activeTool === tool.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/50 text-foreground"
              }`}
            >
              <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTool === tool.id ? "bg-primary-foreground/20" : "bg-primary/10"
              }`}>
                <tool.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${activeTool === tool.id ? "text-primary-foreground" : "text-primary"}`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs sm:text-sm">{tool.label}</p>
                <p className={`text-xs hidden sm:block ${activeTool === tool.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {tool.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Active Tool */}
        <div>
          {activeTool === "chat" && <AiChat mode="chat" />}
          {activeTool === "code" && <AiChat mode="code" />}
          {activeTool === "image" && <AiImage />}
          {activeTool === "music" && <GroqChat />}
        </div>
      </main>
    </div>
  )
}
