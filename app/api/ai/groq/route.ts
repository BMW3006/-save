import { NextRequest, NextResponse } from 'next/server'
import { chatWithGroq, streamGroqChat } from '@/lib/groq-client'

interface ChatRequestBody {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  model?: string
  stream?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json()
    const { messages, model = 'mixtral-8x7b-32768', stream = false } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Groq API is not configured',
          message: 'Please set GROQ_API_KEY environment variable',
        },
        { status: 500 }
      )
    }

    if (stream) {
      try {
        const streamResponse = await streamGroqChat(messages, model)

        return new NextResponse(streamResponse as any, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      } catch (error: any) {
        console.error('[v0] Groq streaming error:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to stream response',
            message: error.message,
          },
          { status: 500 }
        )
      }
    }

    // Non-streaming response
    const result = await chatWithGroq(messages, model)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          role: 'assistant',
          content: result.message,
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get response from Groq',
        message: result.message,
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('[v0] Groq API route error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
