import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 })
  }

  try {
    const { messages, mode } = await request.json()

    // System prompt based on mode
    const systemPrompts: Record<string, string> = {
      code: "You are an expert programming assistant. Provide clean, well-commented code with explanations. Always wrap code in markdown code blocks with the language specified.",
      chat: "You are NADHILI AI, a helpful and friendly assistant for a movie and entertainment platform. You can discuss movies, TV shows, music, and answer general questions. Be concise and engaging.",
    }

    // Free models to try in order (handles upstream rate-limiting by falling back)
    const FREE_MODELS = [
      "meta-llama/llama-3.3-70b-instruct:free",
      "meta-llama/llama-3.2-3b-instruct:free",
      "deepseek/deepseek-r1-distill-llama-70b:free",
      "nvidia/nemotron-nano-9b-v2:free",
    ]

    let lastError = ""

    for (const model of FREE_MODELS) {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          messages: [
            { role: "system", content: systemPrompts[mode] || systemPrompts.chat },
            ...messages,
          ],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content) {
          return NextResponse.json({ content })
        }
      } else {
        lastError = await res.text()
        console.log(`[v0] Model ${model} failed (${res.status}), trying next...`)
        // Continue to next model on rate-limit or unavailability
      }
    }

    console.error("[v0] All models failed:", lastError)
    return NextResponse.json(
      { error: "AI is busy right now (free models rate-limited). Please try again in a moment." },
      { status: 503 }
    )
  } catch (error) {
    console.error("[v0] AI chat error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
