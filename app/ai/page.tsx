"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MessageSquare, Code2, ImageIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AiChat } from "@/components/ai/ai-chat"
import { AiImage } from "@/components/ai/ai-image"

type Tool = "chat" | "code" | "image"

const TOOLS = [
  { id: "chat" as Tool, label: "AI Chat", icon: MessageSquare, desc: "Chat with AI assistant" },
  { id: "code" as Tool, label: "Code Generator", icon: Code2, desc: "Generate code instantly" },
  { id: "image" as Tool, label: "Image Generator", icon: ImageIcon, desc: "Create AI images" },
]

export default function AiPage() {
  const [activeTool, setActiveTool] = useState<Tool>("chat")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground leading-tight">NADHILI AI</h1>
                <p className="text-xs text-muted-foreground">Powered by OpenRouter</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            AI Tools for Everyone
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
            Chat, generate code, and create stunning images — all powered by advanced AI models.
          </p>
        </div>

        {/* Tool Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                activeTool === tool.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/50 text-foreground"
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTool === tool.id ? "bg-primary-foreground/20" : "bg-primary/10"
              }`}>
                <tool.icon className={`h-5 w-5 ${activeTool === tool.id ? "text-primary-foreground" : "text-primary"}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{tool.label}</p>
                <p className={`text-xs ${activeTool === tool.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
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
        </div>
      </main>
    </div>
  )
}
