'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const ClientSchema = z.object({
  name: z.string(),
  email: z.string().nullable(),
  service_requested: z.string(),
  date_requested: z.string().nullable(),
})

const openai = new OpenAI()

export async function parseAndSaveClient(
  rawText: string
): Promise<{ success: true; clientName: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const completion = await openai.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Extract client information from the text. ' +
          'For date_requested, use ISO 8601 (YYYY-MM-DD) if a date is present, otherwise null. ' +
          'For email, extract if present, otherwise null. ' +
          'For service_requested, summarize what the client wants in a short phrase.',
      },
      { role: 'user', content: rawText },
    ],
    response_format: zodResponseFormat(ClientSchema, 'client_info'),
  })

  const parsed = completion.choices[0]?.message.parsed
  if (!parsed) throw new Error('AI did not return structured data')

  const { error } = await supabase.from('clients').insert({
    user_id: user.id,
    raw_text: rawText,
    name: parsed.name,
    email: parsed.email,
    service_requested: parsed.service_requested,
    date_requested: parsed.date_requested,
  })

  if (error) throw new Error(error.message)

  return { success: true, clientName: parsed.name }
}
