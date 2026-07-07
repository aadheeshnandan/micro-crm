'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const ClientSchema = z.object({
  name: z.string(),
  email: z.string().nullable(),
  service_requested: z.string(),
  date_requested: z.string().nullable(),
})

const openai = new OpenAI()

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function parseAndSaveClient(
  rawText: string
): Promise<{ success: true; clientName: string }> {
  const { supabase, user } = await getAuthenticatedUser()

  const completion = await openai.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Extract client information from the text. ' +
          'For date_requested, use ISO 8601 (YYYY-MM-DD) if a date is present, otherwise null. ' +
          'For email, extract if present, otherwise null. ' +
          'For service_requested, summarize what the client wants in a concise phrase.',
      },
      { role: 'user', content: rawText },
    ],
    response_format: zodResponseFormat(ClientSchema, 'client_info'),
  })

  const parsed = completion.choices[0]?.message.parsed
  if (!parsed) throw new Error('AI did not return structured data')

  if (parsed.email) {
    const { data: existing } = await supabase
      .from('clients')
      .select('name')
      .eq('user_id', user.id)
      .eq('email', parsed.email)
      .maybeSingle()

    if (existing) {
      throw new Error(`A client with this email already exists: ${existing.name}`)
    }
  }

  const { error } = await supabase.from('clients').insert({
    user_id: user.id,
    raw_text: rawText,
    name: parsed.name,
    email: parsed.email,
    service_requested: parsed.service_requested,
    date_requested: parsed.date_requested,
    status: 'new',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  return { success: true, clientName: parsed.name }
}

export async function updateClientStatus(id: string, status: string): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser()

  const { error } = await supabase
    .from('clients')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function updateClient(
  id: string,
  data: {
    name: string
    email: string | null
    service_requested: string
    date_requested: string | null
  }
): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser()

  const { error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function deleteClient(id: string): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function generateFollowUp(
  rawText: string,
  clientName: string
): Promise<string> {
  const { user } = await getAuthenticatedUser()
  void user

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a professional freelancer writing a first reply to a new client inquiry. ' +
          'Be warm, specific, and concise — 3 to 4 sentences max. ' +
          'Do not use clichéd openers like "I hope this finds you well." ' +
          'Reference their specific project. End with "Best,".',
      },
      {
        role: 'user',
        content: `Client name: ${clientName}\n\nTheir message:\n${rawText}`,
      },
    ],
  })

  return completion.choices[0]?.message.content ?? ''
}
