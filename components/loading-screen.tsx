"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setIsComplete(true)
          setTimeout(() => {
            onComplete?.()
          }, 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 150)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500",
        isComplete && "pointer-events-none opacity-0"
      )}
    >
      {/* Logo Animation */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/20 blur-xl" />
        
        {/* Logo container */}
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Rotating ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" style={{ animationDuration: "1.5s" }} />
          
          {/* Inner rotating ring */}
          <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-accent" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
          
          {/* Logo text */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-3xl font-black tracking-tighter text-primary">B</span>
            <span className="text-xs font-bold tracking-widest text-foreground">MW</span>
          </div>
        </div>
      </div>

      {/* Brand name */}
      <h1 className="mb-6 text-2xl font-black tracking-wider">
        <span className="text-primary">BMW</span>
        <span className="text-accent"> Community</span>
      </h1>

      {/* Progress bar */}
      <div className="w-64">
        <div className="mb-2 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Loading... {Math.min(Math.round(progress), 100)}%
        </p>
      </div>

      {/* Tagline */}
      <p className="mt-8 text-sm text-muted-foreground">
        Entertainment Hub
      </p>
    </div>
  )
}
