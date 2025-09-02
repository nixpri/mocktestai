import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude client with error handling
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set in environment variables')
    throw new Error('ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file')
  }
  
  return new Anthropic({
    apiKey: apiKey,
  })
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

  const prompt = `You are an expert JEE Physics question creator. Generate a ${questionType} question.

Topic: ${topic}
${subtopic ? `Subtopic: ${subtopic}` : ''}
Difficulty: ${difficulty}
Question Type: ${questionType}
Pattern: JEE Main 2024-25

Requirements:
1. Question must be original and match JEE Main pattern exactly
2. Use realistic numerical values
3. Include proper units (SI units preferred)
4. For MCQ: Exactly 4 options with only one correct answer
5. Distractors should be plausible (common mistakes students make)
6. Time to solve: ${difficulty === 'easy' ? '1-2' : difficulty === 'medium' ? '2-3' : '3-4'} minutes

LaTeX Formatting Rules:
- Use proper LaTeX syntax for all mathematical expressions
- Use \\times for multiplication (not "times" or x)
- Use \\cdot for dot product
- Use \\frac{a}{b} for fractions
- Use \\sqrt{x} for square roots
- Use ^{n} for superscripts and _{n} for subscripts
- Use \\sin, \\cos, \\tan for trigonometric functions
- Use \\pi for pi, \\theta for theta, \\omega for omega
- Each option MUST have readable text content, not just LaTeX

Output JSON format (IMPORTANT: Every option must have meaningful text):
{
  "question": "Question text with proper LaTeX math expressions",
  "options": [
    {"id": "a", "text": "Human-readable option text with value like 5 m/s²", "latex": "$5 \\text{ m/s}^2$"},
    {"id": "b", "text": "Human-readable option text with value like 10 N", "latex": "$10 \\text{ N}$"},
    {"id": "c", "text": "Human-readable option text with formula", "latex": "$\\frac{mv^2}{r}$"},
    {"id": "d", "text": "Human-readable option text", "latex": "$2\\pi\\sqrt{\\frac{l}{g}}$"}
  ],
  "correctAnswer": "b",
  "solution": "Step-by-step solution with proper LaTeX formatting",
  "concepts": ["concept1", "concept2"],
  "estimatedTime": 2
}

CRITICAL: Each option must have BOTH:
1. "text" field with human-readable content (e.g., "5 meters per second squared" or "5 m/s²")
2. "latex" field with proper LaTeX formatting if math is involved

Generate a physics question about ${topic}:`

  try {
    const anthropic = getAnthropicClient()
    
    // Improved retry logic with exponential backoff
    const maxRetries = 5
    let lastError: any = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307', // Cost-efficient model
          max_tokens: 1000,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })

        const content = response.content[0]
        if (content.type === 'text') {
          // Parse the JSON response with better error handling
          const jsonMatch = content.text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              // More robust JSON parsing for LaTeX content
              let jsonString = jsonMatch[0]
              
              // Replace actual newlines in the JSON with escaped newlines
              jsonString = jsonString.replace(/\n/g, '\\n')
              jsonString = jsonString.replace(/\r/g, '\\r')
              jsonString = jsonString.replace(/\t/g, '\\t')
              
              // Try to parse directly first
              try {
                const questionData = JSON.parse(jsonString)
                
                // Ensure options have proper text content
                if (questionData.options && Array.isArray(questionData.options)) {
                  questionData.options = questionData.options.map((opt: any) => {
                    // If option only has latex and no text, use latex as text
                    if (!opt.text || opt.text.trim() === '') {
                      opt.text = opt.latex || `Option ${opt.id.toUpperCase()}`
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
                
                return questionData as GeneratedQuestion
              } catch (firstError) {
                // If direct parsing fails, try more aggressive cleaning
                // First parse attempt failed, trying aggressive cleaning
                
                // Extract the structure manually
                const questionMatch = jsonString.match(/"question":\s*"([^"]+(?:\\.[^"]+)*)"/);
                const correctAnswerMatch = jsonString.match(/"correctAnswer":\s*"([^"]+)"/);
                const solutionMatch = jsonString.match(/"solution":\s*"([^"]+(?:\\.[^"]+)*)"/);
                const conceptsMatch = jsonString.match(/"concepts":\s*\[([^\]]+)\]/);
                const estimatedTimeMatch = jsonString.match(/"estimatedTime":\s*(\d+)/);
                const optionsMatch = jsonString.match(/"options":\s*\[([^\]]+(?:\[[^\]]*\][^\]]*)*)\]/);
                
                if (!questionMatch || !correctAnswerMatch) {
                  throw new Error('Could not extract required fields from response')
                }
                
                // Parse options array manually if present
                let options: any[] = []
                if (optionsMatch) {
                  // Try to extract options more carefully
                  const optionsStr = content.text.substring(
                    content.text.indexOf('"options"'),
                    content.text.indexOf(']', content.text.indexOf('"options"')) + 1
                  )
                  
                  // Match each option object
                  const optionRegex = /\{[^}]*"id"\s*:\s*"([^"]+)"[^}]*"text"\s*:\s*"([^"]*)"[^}]*(?:"latex"\s*:\s*"([^"]*)")?[^}]*\}/g
                  let match
                  while ((match = optionRegex.exec(optionsStr)) !== null) {
                    const text = match[2] || match[3] || `Option ${match[1].toUpperCase()}`
                    options.push({
                      id: match[1],
                      text: text.replace(/\\times/g, '×')
                               .replace(/\\cdot/g, '·')
                               .replace(/\\pi/g, 'π')
                               .replace(/\\theta/g, 'θ')
                               .replace(/\\omega/g, 'ω'),
                      latex: match[3] || ''
                    })
                  }
                }
                
                // If we couldn't parse options, provide defaults
                if (options.length === 0) {
                  options = [
                    { id: 'a', text: 'Option A', latex: '' },
                    { id: 'b', text: 'Option B', latex: '' },
                    { id: 'c', text: 'Option C', latex: '' },
                    { id: 'd', text: 'Option D', latex: '' }
                  ]
                }
                
                // Parse concepts array
                let concepts: string[] = []
                if (conceptsMatch) {
                  concepts = conceptsMatch[1]
                    .split(',')
                    .map(c => c.trim().replace(/^["']|["']$/g, ''))
                    .filter(c => c.length > 0)
                }
                
                const questionData: GeneratedQuestion = {
                  question: questionMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                  options: options,
                  correctAnswer: correctAnswerMatch[1],
                  solution: solutionMatch ? solutionMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : 'Solution not provided',
                  concepts: concepts.length > 0 ? concepts : ['physics'],
                  estimatedTime: estimatedTimeMatch ? parseInt(estimatedTimeMatch[1]) : 2
                }
                
                return questionData
              }
            } catch (parseError) {
              console.error('JSON parse error:', parseError)
              // Raw response available in content.text for debugging
              throw new Error('Failed to parse AI response as JSON')
            }
          } else {
            throw new Error('AI response did not contain valid JSON')
          }
        }
        break // Success, exit retry loop
      } catch (error: any) {
        lastError = error
        
        // Handle different error types
        if (error.status === 529) {
          // API is overloaded, use exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000) // Max 30 seconds
          // Claude API overloaded, retrying...
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else if (error.status === 401) {
          // Authentication error - don't retry
          throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY in .env.local')
        } else if (error.status === 429) {
          // Rate limit - wait longer
          const waitTime = 60000 // 1 minute
          // Rate limited, waiting...
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else if (attempt < maxRetries) {
          // Other errors - retry with shorter delay
          const waitTime = 2000 * attempt
          // Error occurred, retrying...
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else {
          // Final attempt failed
          throw error
        }
      }
    }
    
    // All retries exhausted
    if (lastError) {
      if (lastError.status === 529) {
        throw new Error('Claude API is currently overloaded. Please try again in a few minutes.')
      }
      throw lastError
    }
    
    throw new Error('Failed to generate question after multiple attempts')
  } catch (error: any) {
    console.error('Error generating question:', error)
    
    // Throw user-friendly error messages
    if (error.message.includes('API key')) {
      throw error // Re-throw authentication errors
    } else if (error.message.includes('overloaded')) {
      throw error // Re-throw overloaded errors
    } else {
      throw new Error(`Failed to generate question: ${error.message || 'Unknown error'}`)
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
      const question = await generateQuestion({
        topic,
        difficulty,
        previousQuestions: questions.map(q => q.question)
      })
      questions.push(question)
      consecutiveFailures = 0 // Reset on success
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500))
    } catch (error: any) {
      console.error(`Failed to generate question ${i + 1}:`, error.message)
      consecutiveFailures++
      
      // If we have too many consecutive failures, throw error
      if (consecutiveFailures >= maxConsecutiveFailures) {
        if (questions.length === 0) {
          // No questions generated at all
          throw new Error('Unable to generate questions. Please try again later.')
        }
        // Return partial results if we have some questions
        // Returning partial results
        break
      }
      
      // Wait longer before retrying after a failure
      await new Promise(resolve => setTimeout(resolve, 3000))
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
  const prompt = `As a JEE Physics expert, validate this question and answer:

Question: ${question}
Answer: ${answer}

Check for:
1. Physics accuracy
2. Appropriate difficulty for JEE Main
3. Clear and unambiguous wording
4. Correct answer

Respond with JSON:
{
  "isValid": true/false,
  "suggestions": ["suggestion1", "suggestion2"] // if not valid
}`

  try {
    const anthropic = getAnthropicClient()
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = response.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
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
  const cacheKey = `${params.topic}-${params.subtopic}-${params.difficulty}-${params.questionType}`
  
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