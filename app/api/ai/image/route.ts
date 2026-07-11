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
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `Generate an image: ${prompt}`,
          },
        ],
        modalities: ["image", "text"],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("[v0] OpenRouter image error:", errText)
      return NextResponse.json({ error: "Image generation failed" }, { status: 500 })
    }

    const data = await res.json()
    const message = data.choices?.[0]?.message

    // Image is returned in message.images array as data URLs
    const imageUrl = message?.images?.[0]?.image_url?.url

    if (!imageUrl) {
      return NextResponse.json({ error: "No image generated. Try a different prompt." }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("[v0] AI image error:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
