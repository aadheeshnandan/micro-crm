'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type ActionState = { error: string | null }

// VERCEL_URL is injected automatically by Vercel on every deployment.
// No manual environment variable needed.
function getCallbackUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/auth/callback`
  }
  return 'http://localhost:3000/auth/callback'
}

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function signup(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: getCallbackUrl(),
    },
  })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function signout(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function tryAnonymously(): Promise<ActionState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInAnonymously()

  if (error) return { error: error.message }

  redirect('/dashboard')
}
