import { NextRequest, NextResponse } from "next/server"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

// Rate limiting: 5 requests per minute per IP
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const oneMinuteAgo = now - 60000
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now])
    return true
  }
  
  const timestamps = rateLimitMap.get(ip)!.filter(t => t > oneMinuteAgo)
  
  if (timestamps.length >= 5) {
    return false
  }
  
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  return true
}

// GET / - API Info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  
  // Check if it's a status check
  if (searchParams.get("status") === "1") {
    return NextResponse.json({
      status: "ok",
      api: "BMW Community OpenRouter API",
      version: "1.0",
      endpoints: [
        "GET / - API info",
        "GET /?status=1 - Status check",
        "POST /api/openrouter - Chat endpoint",
        "GET /api/openrouter?q=hello - Quick query",
        "POST /api/openrouter/stream - Streaming endpoint"
      ]
    })
  }
  
  // Default: return API documentation
  return NextResponse.json({
    name: "BMW Community OpenRouter API",
    version: "1.0.0",
    description: "Standalone OpenRouter API backend with rate limiting and CORS",
    endpoints: {
      "GET /": "API documentation",
      "GET /?status=1": "Check API status",
      "GET /api/openrouter?q=hello": "Quick query endpoint",
      "POST /api/openrouter": "Full chat endpoint (POST body with messages)",
      "POST /api/openrouter/stream": "Streaming responses (Server-Sent Events)"
    },
    rateLimit: "5 requests per minute per IP",
    models: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "meta-llama/llama-3.2-3b-instruct:free",
      "google/gemini-2.5-flash-image"
    ]
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}

// POST /api/openrouter - Chat endpoint
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  
  // Check rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded: 5 requests per minute" },
      { status: 429 }
    )
  }
  
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 }
    )
  }
  
  try {
    const body = await request.json()
    const { messages, model = "meta-llama/llama-3.3-70b-instruct:free" } = body
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      )
    }
    
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1500,
      }),
    })
    
    if (!res.ok) {
      const error = await res.text()
      console.error(`[v0] OpenRouter error (${res.status}):`, error)
      
      // Handle rate limiting with friendly message
      if (res.status === 429) {
        return NextResponse.json(
          { 
            error: "API is currently busy. Please try again in a moment.",
            status: 429,
            message: "Free tier models are temporarily rate-limited. Standard tier models available on demand."
          },
          { status: 429 }
        )
      }
      
      // Handle other errors
      return NextResponse.json(
        { 
          error: `API error: ${res.status}`,
          details: error.substring(0, 200)
        },
        { status: res.status }
      )
    }
    
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    
    return NextResponse.json({
      success: true,
      message: content,
      model,
      usage: data.usage
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
    
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    }
  })
}
