import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()
      
      // If profile doesn't exist, create it (backup in case trigger fails)
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || 
                      data.user.user_metadata?.name || 
                      data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url || 
                       data.user.user_metadata?.picture
          })
        
        if (insertError) {
          console.error('Error creating profile in callback:', insertError)
          // Don't fail auth, trigger should handle it
        } else {
          console.log('Profile created successfully in callback')
        }
      }
    }
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}