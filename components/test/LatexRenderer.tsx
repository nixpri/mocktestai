'use client'

import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface LatexRendererProps {
  content: string
  className?: string
}

export default function LatexRenderer({ content, className = '' }: LatexRendererProps) {
  const processInlineMath = (text: string): Array<{ type: 'text' | 'latex', content: string }> => {
    const parts: Array<{ type: 'text' | 'latex', content: string }> = []
    const inlineRegex = /\$(.*?)\$/g
    let lastIndex = 0
    let match
    
    while ((match = inlineRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        })
      }
      
      // Add inline math
      parts.push({
        type: 'latex',
        content: match[1]
      })
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      })
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: text }]
  }

  const processedContent = useMemo(() => {
    if (!content) return []
    
    // Unescape LaTeX content (convert \\ to \, handle align environments)
    let processedText = content
      .replace(/\\\\begin\{align\*?\}/g, '$$\\begin{align*}')
      .replace(/\\\\end\{align\*?\}/g, '\\end{align*}$$')
      .replace(/\\\\text\{/g, '\\text{')
      .replace(/\\\\frac\{/g, '\\frac{')
      .replace(/\\\\eta/g, '\\eta')
      .replace(/\\\\%/g, '\\%')
      .replace(/\\\\\s*(?=[a-zA-Z])/g, '\\') // Replace \\ followed by letters with single \
    
    // Split content by LaTeX delimiters
    const parts: Array<{ type: 'text' | 'latex' | 'display', content: string }> = []
    let lastIndex = 0
    
    // First find display math $$...$$
    const displayRegex = /\$\$(.*?)\$\$/gs // Added 's' flag for multiline
    let displayMatch
    
    while ((displayMatch = displayRegex.exec(processedText)) !== null) {
      // Add text before match
      if (displayMatch.index > lastIndex) {
        const textContent = processedText.substring(lastIndex, displayMatch.index)
        // Check for inline math in this text segment
        parts.push(...processInlineMath(textContent))
      }
      
      // Add display math
      parts.push({
        type: 'display',
        content: displayMatch[1]
      })
      
      lastIndex = displayMatch.index + displayMatch[0].length
    }
    
    // Process remaining text for inline math
    if (lastIndex < processedText.length) {
      const remainingText = processedText.substring(lastIndex)
      parts.push(...processInlineMath(remainingText))
    }
    
    // If no LaTeX found, just return the text
    if (parts.length === 0) {
      return [{ type: 'text' as const, content: processedText }]
    }
    
    return parts
  }, [content])
  
  const renderPart = (part: { type: string, content: string }, index: number) => {
    if (part.type === 'text') {
      return <span key={index}>{part.content}</span>
    }
    
    try {
      const html = katex.renderToString(part.content.trim(), {
        displayMode: part.type === 'display',
        throwOnError: false,
        strict: false,
        trust: true
      })
      
      if (part.type === 'display') {
        return (
          <div 
            key={index}
            className="my-4 text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      }
      
      return (
        <span 
          key={index}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    } catch (error) {
      console.error('KaTeX rendering error:', error)
      return <span key={index} className="text-red-600">{`$${part.content}$`}</span>
    }
  }
  
  return (
    <div className={className}>
      {processedContent.map((part, index) => renderPart(part, index))}
    </div>
  )
}