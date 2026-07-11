"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Sparkles, User, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AiChatProps {
  mode: "chat" | "code"
}

function MessageContent({ content }: { content: string }) {
  const [copied, setCopied] = useState<number | null>(null)

  // Split content into text and code blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-2">
      {parts.map((part, idx) => {
        if (part.startsWith("```")) {
          const lines = part.slice(3, -3).split("\n")
          const lang = lines[0].trim()
          const code = lines.slice(lang ? 1 : 0).join("\n")
          return (
            <div key={idx} className="relative rounded-lg overflow-hidden bg-[#1a1a1a] border border-border">
              <div className="flex items-center justify-between px-3 py-1.5 bg-black/40">
                <span className="text-xs text-muted-foreground font-mono">{lang || "code"}</span>
                <button
                  onClick={() => copyCode(code, idx)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === idx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-sm">
                <code className="font-mono text-green-400">{code}</code>
              </pre>
            </div>
          )
        }
        return part.trim() ? (
          <p key={idx} className="text-sm leading-relaxed whitespace-pre-wrap">
            {part}
          </p>
        ) : null
      })}
    </div>
  )
}

export function AiChat({ mode }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, mode }),
      })
      const data = await res.json()
      if (data.content) {
        setMessages([...newMessages, { role: "assistant", content: data.content }])
      } else {
        setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't process that request." }])
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
      setMessages([...newMessages, { role: "assistant", content: "An error occurred. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const placeholder = mode === "code"
    ? "Describe the code you need..."
    : "Ask me anything about movies, shows, or general questions..."

  const examples = mode === "code"
    ? ["Write a React counter component", "Python function to reverse a string", "CSS for a centered card"]
    : ["Recommend action movies", "Best sci-fi shows 2024", "Explain quantum computing simply"]

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-2xl border border-border overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {mode === "code" ? "Code Generator" : "AI Assistant"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "code" ? "Generate code in any language" : "Your intelligent companion"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInput(ex)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-primary" : "bg-secondary"
              }`}>
                {msg.role === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}>
                <MessageContent content={msg.content} />
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="bg-secondary border-border"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
