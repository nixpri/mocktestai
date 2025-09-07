// Groq AI integration for MockTest AI
// Using FREE Llama 3.3 70B model - NO CREDIT CARD REQUIRED!
// Sign up at: https://console.groq.com

interface GroqResponse {
  id: string
  choices: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Initialize Groq client
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY
  
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set in environment variables')
    throw new Error('GROQ_API_KEY is not configured. Sign up for FREE at https://console.groq.com (no credit card required!)')
  }
  
  console.log('Using Groq with key starting with:', apiKey.substring(0, 10) + '...')
  return apiKey
}

export interface GenerateQuestionParams {
  topic: string
  subtopic?: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionType?: 'mcq' | 'numerical' | 'assertion_reasoning'
  previousQuestions?: string[] // To avoid repetition
}

export interface GeneratedQuestion {
  question: string
  options?: Array<{ id: string; text: string; latex?: string }>
  correctAnswer: string | number
  solution: string
  concepts: string[]
  estimatedTime: number // in minutes
}

export async function generateQuestion(params: GenerateQuestionParams): Promise<GeneratedQuestion> {
  const { topic, subtopic, difficulty, questionType = 'mcq' } = params

  const subtopicLine = subtopic ? ('Subtopic: ' + subtopic + '\n') : ''
  const timeToSolve = difficulty === 'easy' ? '1-2' : difficulty === 'medium' ? '2-3' : '3-4'
  
  const prompt = 'Generate a JEE Main 2024-25 Physics MCQ question.\n\n' +
    'Topic: ' + topic + '\n' +
    subtopicLine +
    'Difficulty: ' + difficulty + '\n' +
    'Time to solve: ' + timeToSolve + ' minutes\n\n' +
    'CRITICAL RULES:\n' +
    '1. Options must NEVER contain explanations or calculations\n' +
    '2. Options must be ONLY the final answer value with units\n' +
    '3. Do NOT show working in options\n' +
    '4. Each option must be different and plausible\n' +
    '5. Only ONE option should be correct\n\n' +
    'EXACT JSON FORMAT (no markdown, no code blocks):\n' +
    '{\n' +
    '  "question": "A car accelerates from rest...",\n' +
    '  "options": [\n' +
    '    {"id": "a", "text": "5 m/s"},\n' +
    '    {"id": "b", "text": "10 m/s"},\n' +
    '    {"id": "c", "text": "15 m/s"},\n' +
    '    {"id": "d", "text": "20 m/s"}\n' +
    '  ],\n' +
    '  "correctAnswer": "b",\n' +
    '  "solution": "Using v = u + at...",\n' +
    '  "concepts": ["kinematics", "acceleration"],\n' +
    '  "estimatedTime": ' + (difficulty === 'easy' ? '2' : difficulty === 'medium' ? '3' : '4') + '\n' +
    '}'

  try {
    const apiKey = getGroqClient()
    
    // Groq uses OpenAI-compatible API format
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Best model for JEE Physics on Groq
        messages: [
          {
            role: 'system',
            content: 'You are a JEE Physics expert. You must respond with ONLY valid JSON, no markdown formatting, no code blocks, no extra text. Start your response with { and end with }.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2048,
        temperature: 0.3 // Lower temperature for more consistent mathematical answers
        // Note: response_format not included as it may cause issues with some models
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Groq API error:', response.status, errorData)
      
      if (response.status === 429) {
        throw new Error('Rate limit reached. Please wait a moment and try again.')
      }
      
      throw new Error('Groq API error: ' + response.status)
    }

    const data = await response.json() as GroqResponse
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Groq')
    }

    let content = data.choices[0].message.content
    console.log('Groq response length:', content.length)
    console.log('Groq tokens per second:', data.usage ? Math.round((data.usage.completion_tokens / 2)) + ' t/s' : 'unknown')
    
    // Clean up the response - remove markdown code blocks if present
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    
    // Parse JSON response with better error handling
    let questionData
    try {
      // First attempt: direct parse
      questionData = JSON.parse(content)
    } catch (parseError) {
      console.log('Direct JSON parse failed, attempting fixes...')
      
      // Extract JSON object from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON object found in response:', content)
        throw new Error('Invalid response format - no JSON found')
      }
      
      let jsonStr = jsonMatch[0]
      
      // Fix common JSON issues
      // Remove trailing commas
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1')
      // Fix single quotes to double quotes
      jsonStr = jsonStr.replace(/'/g, '"')
      // Remove any control characters
      jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, '')
      
      try {
        questionData = JSON.parse(jsonStr)
      } catch (e) {
        console.error('Failed to parse even after fixes. Response:', content)
        throw new Error('Failed to parse AI response as JSON')
      }
    }
    
    // Ensure options have proper text content and no explanations
    if (questionData.options && Array.isArray(questionData.options)) {
      questionData.options = questionData.options.map((opt: any, index: number) => {
        // Ensure each option has an ID
        if (!opt.id) {
          opt.id = String.fromCharCode(97 + index) // a, b, c, d
        }
        
        // Ensure text exists
        if (!opt.text || opt.text.trim() === '') {
          opt.text = opt.latex || ('Option ' + opt.id.toUpperCase())
        }
        
        // Remove any explanations or calculations from options
        // If option contains "because", "since", "=", or multiple sentences, extract just the answer
        if (opt.text.includes('because') || opt.text.includes('since') || opt.text.includes('=')) {
          // Try to extract just the numerical answer with units
          const answerMatch = opt.text.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z/]+(?:\^?\d+)?)/);
          if (answerMatch) {
            opt.text = answerMatch[0];
          }
        }
        
        // Clean up LaTeX symbols for display
        if (opt.text) {
          opt.text = opt.text.replace(/\\times/g, '×')
                            .replace(/\\cdot/g, '·')
                            .replace(/\\pi/g, 'π')
                            .replace(/\\theta/g, 'θ')
                            .replace(/\\omega/g, 'ω')
                            .replace(/\\alpha/g, 'α')
                            .replace(/\\beta/g, 'β')
                            .replace(/\\gamma/g, 'γ')
                            .replace(/\\Delta/g, 'Δ')
                            .replace(/\\lambda/g, 'λ')
                            .replace(/\\mu/g, 'μ')
                            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2') // Simple fraction display
                            .trim()
        }
        
        // Add LaTeX field if it contains mathematical notation
        if (opt.text && (opt.text.includes('×') || opt.text.includes('/') || opt.text.includes('^'))) {
          opt.latex = '$' + opt.text.replace(/×/g, '\\times').replace(/·/g, '\\cdot') + '$'
        }
        
        return opt
      })
    }
    
    // Validate the response structure
    if (!questionData.question || !questionData.options || !questionData.correctAnswer) {
      console.error('Invalid question structure:', questionData)
      throw new Error('Invalid question structure - missing required fields')
    }
    
    // Ensure correctAnswer is in the right format (single letter a, b, c, or d)
    if (typeof questionData.correctAnswer === 'string') {
      // Extract just the letter if it's in a format like "Option a" or "(a)"
      const match = questionData.correctAnswer.match(/[a-d]/i)
      if (match) {
        questionData.correctAnswer = match[0].toLowerCase()
      }
    }
    
    // Validate correctAnswer is valid
    if (!['a', 'b', 'c', 'd'].includes(questionData.correctAnswer)) {
      console.error('Invalid correctAnswer:', questionData.correctAnswer)
      questionData.correctAnswer = 'a' // Default to 'a' if invalid
    }
    
    // Ensure all required fields have proper defaults
    questionData.concepts = questionData.concepts || ['physics']
    questionData.estimatedTime = questionData.estimatedTime || (difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4)
    questionData.solution = questionData.solution || 'Solution not provided'
    
    return questionData as GeneratedQuestion
    
  } catch (error: any) {
    console.error('Error generating question with Groq:', error)
    
    if (error.message.includes('Rate limit')) {
      throw error // Re-throw rate limit errors as-is
    } else if (error.message.includes('API key')) {
      throw error // Re-throw auth errors
    } else {
      throw new Error('Failed to generate question: ' + (error.message || 'Unknown error'))
    }
  }
}

export async function generateMockTest(params: {
  topics: string[]
  totalQuestions: number
  difficultyDistribution?: {
    easy: number
    medium: number
    hard: number
  }
}): Promise<GeneratedQuestion[]> {
  const { topics, totalQuestions, difficultyDistribution } = params
  
  const distribution = difficultyDistribution || {
    easy: Math.floor(totalQuestions * 0.3),
    medium: Math.floor(totalQuestions * 0.5),
    hard: Math.floor(totalQuestions * 0.2)
  }

  const questions: GeneratedQuestion[] = []
  const difficulties: Array<'easy' | 'medium' | 'hard'> = []
  
  // Create difficulty array
  for (let i = 0; i < distribution.easy; i++) difficulties.push('easy')
  for (let i = 0; i < distribution.medium; i++) difficulties.push('medium')
  for (let i = 0; i < distribution.hard; i++) difficulties.push('hard')
  
  // Fill remaining with medium difficulty
  while (difficulties.length < totalQuestions) {
    difficulties.push('medium')
  }
  
  // Shuffle difficulties
  difficulties.sort(() => Math.random() - 0.5)

  // Groq is FAST - 800+ tokens/second! 
  // But still add small delay to be respectful
  const DELAY_BETWEEN_REQUESTS = 500 // 0.5 seconds between requests
  
  console.log('Using Groq (ultra-fast inference). Generating questions...')
  
  for (let i = 0; i < totalQuestions; i++) {
    const topic = topics[i % topics.length]
    const difficulty = difficulties[i]
    
    try {
      console.log('Generating question ' + (i + 1) + ' of ' + totalQuestions + ' - ' + topic + ' (' + difficulty + ')')
      
      const startTime = Date.now()
      const question = await generateQuestion({
        topic,
        difficulty,
        previousQuestions: questions.map(q => q.question)
      })
      const elapsed = Date.now() - startTime
      
      console.log('Generated in ' + (elapsed/1000).toFixed(2) + ' seconds')
      questions.push(question)
      
      // Small delay to avoid hitting rate limits
      if (i < totalQuestions - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
      }
      
    } catch (error: any) {
      console.error('Failed to generate question ' + (i + 1) + ':', error.message)
      
      if (error.message.includes('Rate limit')) {
        console.log('Rate limit hit. Waiting 10 seconds before continuing...')
        await new Promise(resolve => setTimeout(resolve, 10000))
        i-- // Retry this question
      } else if (questions.length > 0) {
        // Return partial results if we have at least one question
        console.log('Returning ' + questions.length + ' questions (partial results)')
        break
      } else {
        throw error
      }
    }
  }
  
  if (questions.length === 0) {
    throw new Error('Failed to generate any questions. Please try again.')
  }

  return questions
}

// Cache generated questions to reduce API calls
const questionCache = new Map<string, GeneratedQuestion>()

export async function getCachedOrGenerateQuestion(params: GenerateQuestionParams): Promise<GeneratedQuestion> {
  const cacheKey = params.topic + '-' + (params.subtopic || '') + '-' + params.difficulty + '-' + (params.questionType || 'mcq')
  
  if (questionCache.has(cacheKey)) {
    return questionCache.get(cacheKey)!
  }
  
  const question = await generateQuestion(params)
  questionCache.set(cacheKey, question)
  
  // Clear cache if it gets too large
  if (questionCache.size > 100) {
    const firstKey = questionCache.keys().next().value
    if (firstKey !== undefined) {
      questionCache.delete(firstKey)
    }
  }
  
  return question
}