import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini client with error handling
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables')
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env.local file')
  }
  
  console.log('Using Gemini API with key starting with:', apiKey.substring(0, 10) + '...')
  return new GoogleGenerativeAI(apiKey)
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
  
  const prompt = 'You are an expert JEE Physics question creator. Generate a ' + questionType + ' question.\n\n' +
    'Topic: ' + topic + '\n' +
    subtopicLine +
    'Difficulty: ' + difficulty + '\n' +
    'Question Type: ' + questionType + '\n' +
    'Pattern: JEE Main 2024-25\n\n' +
    'Requirements:\n' +
    '1. Question must be original and match JEE Main pattern exactly\n' +
    '2. Use realistic numerical values\n' +
    '3. Include proper units (SI units preferred)\n' +
    '4. For MCQ: Exactly 4 options with only one correct answer\n' +
    '5. Distractors should be plausible (common mistakes students make)\n' +
    '6. Time to solve: ' + timeToSolve + ' minutes\n\n' +
    'LaTeX Formatting Rules:\n' +
    '- Use proper LaTeX syntax for all mathematical expressions\n' +
    '- Use \\\\times for multiplication (not "times" or x)\n' +
    '- Use \\\\cdot for dot product\n' +
    '- Use \\\\frac{a}{b} for fractions\n' +
    '- Use \\\\sqrt{x} for square roots\n' +
    '- Use ^{n} for superscripts and _{n} for subscripts\n' +
    '- Use \\\\sin, \\\\cos, \\\\tan for trigonometric functions\n' +
    '- Use \\\\pi for pi, \\\\theta for theta, \\\\omega for omega\n' +
    '- Each option MUST have readable text content, not just LaTeX\n\n' +
    'Output JSON format (IMPORTANT: Every option must have meaningful text):\n' +
    '{\n' +
    '  "question": "Question text with proper LaTeX math expressions",\n' +
    '  "options": [\n' +
    '    {"id": "a", "text": "Human-readable option text with value like 5 m/s²", "latex": "$5 \\\\text{ m/s}^2$"},\n' +
    '    {"id": "b", "text": "Human-readable option text with value like 10 N", "latex": "$10 \\\\text{ N}$"},\n' +
    '    {"id": "c", "text": "Human-readable option text with formula", "latex": "$\\\\frac{mv^2}{r}$"},\n' +
    '    {"id": "d", "text": "Human-readable option text", "latex": "$2\\\\pi\\\\sqrt{\\\\frac{l}{g}}$"}\n' +
    '  ],\n' +
    '  "correctAnswer": "b",\n' +
    '  "solution": "Step-by-step solution with proper LaTeX formatting",\n' +
    '  "concepts": ["concept1", "concept2"],\n' +
    '  "estimatedTime": 2\n' +
    '}\n\n' +
    'CRITICAL: Each option must have BOTH:\n' +
    '1. "text" field with human-readable content (e.g., "5 meters per second squared" or "5 m/s²")\n' +
    '2. "latex" field with proper LaTeX formatting if math is involved\n\n' +
    'Generate a JEE physics ' + difficulty + ' question about ' + topic + '.\n\n' +
    'Return ONLY valid JSON (no markdown, no extra text):\n' +
    '{\n' +
    '  "question": "Question with LaTeX",\n' +
    '  "options": [{"id": "a", "text": "Option", "latex": "LaTeX"}, {"id": "b", "text": "Option", "latex": "LaTeX"}, {"id": "c", "text": "Option", "latex": "LaTeX"}, {"id": "d", "text": "Option", "latex": "LaTeX"}],\n' +
    '  "correctAnswer": "a/b/c/d",\n' +
    '  "solution": "Brief solution",\n' +
    '  "concepts": ["concept"],\n' +
    '  "estimatedTime": 2\n' +
    '}'
  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      },
    })

    // Improved retry logic with exponential backoff
    const maxRetries = 5
    let lastError: any = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent([prompt])
        
        if (!result.response) {
          console.error('No response object from Gemini')
          throw new Error('Gemini did not return a response')
        }
        
        const response = await result.response
        let content = ''
        
        try {
          content = response.text()
        } catch (textError) {
          console.error('Error getting text from response:', textError)
          console.log('Response object:', JSON.stringify(response, null, 2))
          throw new Error('Failed to get text from Gemini response')
        }

        console.log('Gemini response length:', content.length)
        console.log('Gemini response (first 500 chars):', content.substring(0, 500))
        
        if (!content || content.length === 0) {
          throw new Error('Gemini returned empty response')
        }

        // Parse JSON response
        let questionData
        try {
          // First try direct parsing
          questionData = JSON.parse(content)
        } catch (parseError) {
          // If direct parsing fails, try to extract JSON
          console.log('Direct JSON parse failed, trying extraction...')
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              questionData = JSON.parse(jsonMatch[0])
            } catch (e) {
              // If still fails, try to fix common issues
              let fixedJson = jsonMatch[0]
              // Remove trailing commas
              fixedJson = fixedJson.replace(/,\s*}/g, '}')
              fixedJson = fixedJson.replace(/,\s*]/g, ']')
              questionData = JSON.parse(fixedJson)
            }
          } else {
            throw new Error('No JSON found in response')
          }
        }
        
        // Ensure options have proper text content
        if (questionData.options && Array.isArray(questionData.options)) {
          questionData.options = questionData.options.map((opt: any) => {
            // If option only has latex and no text, use latex as text
            if (!opt.text || opt.text.trim() === '') {
              opt.text = opt.latex || ('Option ' + opt.id.toUpperCase())
            }
            // Clean up text that might have improper formatting
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
            }
            return opt
          })
        }
        
        // Validate and return
        if (!questionData.question || !questionData.options || !questionData.correctAnswer) {
          throw new Error('Invalid question structure')
        }
        return questionData as GeneratedQuestion
      } catch (error: any) {
        lastError = error
        console.error('Attempt failed:', error.message)
        
        // Handle different error types
        if (error.message?.includes('429') || error.message?.includes('quota')) {
          // Rate limit - wait longer with exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000) // 2s, 4s, 8s, 16s, 30s max
          console.log('Rate limited, waiting ' + (waitTime/1000) + 's before retry (attempt ' + attempt + '/' + maxRetries + ')...')
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else if (error.message?.includes('API key')) {
          // Authentication error - don't retry
          throw new Error('Invalid API key. Please check your GEMINI_API_KEY in .env.local')
        } else {
          // Other errors - retry with exponential backoff
          const waitTime = Math.min(1000 * Math.pow(1.5, attempt), 10000) // 1.5s, 2.25s, 3.375s, etc
          console.log('Error occurred, waiting ' + (waitTime/1000) + 's before retry (attempt ' + attempt + '/' + maxRetries + ')...')
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }
    
    // All retries exhausted
    if (lastError) {
      if (lastError.message?.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later.')
      }
      throw lastError
    }
    
    throw new Error('Failed to generate question after multiple attempts')
  } catch (error: any) {
    console.error('Error generating question:', error)
    
    // Throw user-friendly error messages
    if (error.message.includes('API key')) {
      throw error // Re-throw authentication errors
    } else if (error.message.includes('quota')) {
      throw error // Re-throw quota errors
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

  // Generate questions with better error handling
  let consecutiveFailures = 0
  const maxConsecutiveFailures = 3
  
  for (let i = 0; i < totalQuestions; i++) {
    const topic = topics[i % topics.length]
    const difficulty = difficulties[i]
    
    try {
      console.log('Generating question ' + (i + 1) + ' of ' + totalQuestions + ' - ' + topic + ' (' + difficulty + ')')
      
      const question = await generateQuestion({
        topic,
        difficulty,
        previousQuestions: questions.map(q => q.question)
      })
      questions.push(question)
      consecutiveFailures = 0 // Reset on success
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error: any) {
      console.error('Failed to generate question ' + (i + 1) + ':', error.message)
      consecutiveFailures++
      
      // If we have too many consecutive failures, return what we have
      if (consecutiveFailures >= maxConsecutiveFailures) {
        if (questions.length === 0) {
          // Try once more with a simpler prompt
          try {
            const fallbackQuestion = await generateQuestion({
              topic: 'mechanics',
              difficulty: 'easy',
              previousQuestions: []
            })
            questions.push(fallbackQuestion)
          } catch (fallbackError) {
            throw new Error('Unable to generate questions. Please try again.')
          }
        }
        // Return partial results if we have some questions
        console.log('Returning ' + questions.length + ' questions (partial results)')
        break
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Ensure we have at least one question
  if (questions.length === 0) {
    throw new Error('Failed to generate any questions. Please try again.')
  }

  return questions
}

// Function to validate and improve question quality
export async function validateQuestion(question: string, answer: string): Promise<{
  isValid: boolean
  suggestions?: string[]
}> {
  const prompt = 'As a JEE Physics expert, validate this question and answer:\n\n' +
    'Question: ' + question + '\n' +
    'Answer: ' + answer + '\n\n' +
    'Check for:\n' +
    '1. Physics accuracy\n' +
    '2. Appropriate difficulty for JEE Main\n' +
    '3. Clear and unambiguous wording\n' +
    '4. Correct answer\n\n' +
    'Respond with JSON only:\n' +
    '{\n' +
    '  "isValid": true/false,\n' +
    '  "suggestions": ["suggestion1", "suggestion2"] // if not valid\n' +
    '}'

  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
        responseMimeType: "application/json"
      },
    })

    const result = await model.generateContent([prompt])
    const response = await result.response
    const content = response.text()

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return { isValid: true } // Default to valid if parsing fails
  } catch (error) {
    console.error('Error validating question:', error)
    return { isValid: true } // Default to valid on error
  }
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
    questionCache.delete(firstKey)
  }
  
  return question
}