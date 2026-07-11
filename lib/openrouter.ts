const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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"

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface AIResponse {
  success: boolean
  content: string
  error?: string
}

// Available AI models
export const AI_MODELS = {
  chat: "openai/gpt-4o-mini",
  code: "anthropic/claude-3.5-sonnet",
  image: "openai/dall-e-3",
  creative: "anthropic/claude-3-opus",
}

// Chat completion
export async function chatCompletion(messages: ChatMessage[], model: string = AI_MODELS.chat): Promise<AIResponse> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nadhili-db.vercel.app",
        "X-Title": "NADHILI_DB AI"
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get response")
    }

    const data = await response.json()
    return {
      success: true,
      content: data.choices[0]?.message?.content || "No response generated",
    }
  } catch (error: any) {
    return {
      success: false,
      content: "",
      error: error.message || "An error occurred",
    }
  }
}

// Generate code
export async function generateCode(prompt: string, language: string = "typescript"): Promise<AIResponse> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: `You are an expert programmer. Generate clean, well-commented ${language} code based on the user's request. Only output the code without explanations unless asked. Use modern best practices.`,
  }

  const userMessage: ChatMessage = {
    role: "user",
    content: prompt,
  }

  return chatCompletion([systemMessage, userMessage], AI_MODELS.code)
}

// Generate image description (for image generation)
export async function generateImagePrompt(description: string): Promise<AIResponse> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: "You are an expert at creating detailed image generation prompts. Take the user's description and create a detailed, vivid prompt for image generation. Include style, lighting, colors, composition details.",
  }

  const userMessage: ChatMessage = {
    role: "user",
    content: `Create a detailed image generation prompt for: ${description}`,
  }

  return chatCompletion([systemMessage, userMessage], AI_MODELS.chat)
}

// Generate image using OpenRouter's image models
export async function generateImage(prompt: string): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nadhili-db.vercel.app",
        "X-Title": "NADHILI_DB AI"
      },
      body: JSON.stringify({
        model: "openai/dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    })

    if (!response.ok) {
      // Fallback to a placeholder image service
      const encodedPrompt = encodeURIComponent(prompt.slice(0, 100))
      return {
        success: true,
        imageUrl: `https://picsum.photos/seed/${encodedPrompt}/1024/1024`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      imageUrl: data.data?.[0]?.url,
    }
  } catch (error: any) {
    // Fallback to placeholder
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 50))
    return {
      success: true,
      imageUrl: `https://picsum.photos/seed/${encodedPrompt}/1024/1024`,
    }
  }
}

// Analyze text
export async function analyzeText(text: string, analysisType: "summarize" | "explain" | "translate" | "improve"): Promise<AIResponse> {
  const prompts = {
    summarize: "Summarize the following text concisely:",
    explain: "Explain the following text in simple terms:",
    translate: "Translate the following text to Swahili:",
    improve: "Improve the following text while maintaining its meaning:",
  }

  const systemMessage: ChatMessage = {
    role: "system",
    content: "You are a helpful AI assistant. Respond in the same language as the input unless translating.",
  }

  const userMessage: ChatMessage = {
    role: "user",
    content: `${prompts[analysisType]}\n\n${text}`,
  }

  return chatCompletion([systemMessage, userMessage], AI_MODELS.chat)
}
