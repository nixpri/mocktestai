import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY
  const keyPrefix = process.env.ANTHROPIC_API_KEY ? 
    process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...' : 
    'NOT_SET'
  
  return NextResponse.json({
    configured: hasApiKey,
    keyPrefix: keyPrefix,
    message: hasApiKey ? 
      'API key is configured correctly' : 
      'API key is missing. Please add ANTHROPIC_API_KEY to your .env.local file',
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ANTHROPIC_API_KEY: hasApiKey
    }
  })
}