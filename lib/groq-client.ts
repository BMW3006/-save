import Groq from 'groq-sdk'

let groqClient: Groq | null = null

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set')
    }
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function chatWithGroq(messages: ChatMessage[], model: string = 'mixtral-8x7b-32768') {
  const client = getGroqClient()
  
  try {
    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      system: `You are a helpful music assistant for BMW Community. You can help users with song recommendations, music information, and questions about music. Be friendly and informative.`,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    })
    
    const content = response.content[0]
    if (content.type === 'text') {
      return {
        success: true,
        message: content.text,
      }
    }
    
    return {
      success: false,
      message: 'Unexpected response format from Groq',
    }
  } catch (error: any) {
    console.error('[v0] Groq API error:', error)
    return {
      success: false,
      message: error.message || 'Failed to get response from Groq AI',
    }
  }
}

export async function streamGroqChat(messages: ChatMessage[], model: string = 'mixtral-8x7b-32768') {
  const client = getGroqClient()
  
  try {
    const stream = await client.messages.create({
      model,
      max_tokens: 1024,
      system: `You are a helpful music assistant for BMW Community. You can help users with song recommendations, music information, and questions about music. Be friendly and informative.`,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    })
    
    return stream
  } catch (error: any) {
    console.error('[v0] Groq streaming error:', error)
    throw error
  }
}

export const GROQ_MODELS = [
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B (Fast & Balanced)',
  },
  {
    id: 'llama2-70b-4096',
    name: 'Llama 2 70B (Most Capable)',
  },
  {
    id: 'gemma-7b-it',
    name: 'Gemma 7B (Lightweight)',
  },
]
