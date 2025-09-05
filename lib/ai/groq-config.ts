// Groq Configuration for MockTest AI
// Using Llama 3.3 70B Versatile - Best available model for JEE Physics

export const GROQ_CONFIG = {
  model: 'llama-3.3-70b-versatile',
  modelName: 'Llama 3.3 70B Versatile',
  contextWindow: 128000, // 128K tokens
  temperature: 0.3, // Low temperature for consistent mathematical answers
  maxTokens: 2048,
  features: {
    mathReasoning: 'excellent',
    physicsCapability: 'excellent', 
    speed: '800+ tokens/second',
    contextSize: '128K tokens',
    cost: 'FREE'
  },
  strengths: [
    'Mathematical reasoning',
    'Physics problem solving',
    'Complex calculations',
    'Step-by-step solutions',
    'Educational content generation'
  ]
}

// API Configuration
export const GROQ_API_CONFIG = {
  baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
  headers: (apiKey: string) => ({
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
  }),
  rateLimit: {
    requestsPerMinute: 30, // Free tier estimate
    tokensPerMinute: 200000
  }
}

// System prompt for JEE Physics
export const JEE_PHYSICS_SYSTEM_PROMPT = 'You are a JEE Physics expert. Always respond with valid JSON only, no markdown or extra text.'