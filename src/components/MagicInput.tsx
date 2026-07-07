'use client'

import { useState, useTransition } from 'react'
import { parseAndSaveClient } from '@/app/dashboard/actions'

export default function MagicInput() {
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setFeedback(null)
    startTransition(async () => {
      try {
        const result = await parseAndSaveClient(text)
        setText('')
        setFeedback({
          type: 'success',
          message: `"${result.clientName}" saved successfully.`,
        })
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Something went wrong.',
        })
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Magic Input</h2>
      <p className="text-sm text-gray-500 mb-4">
        Paste a message or note from a client — AI will extract and save their
        info automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isPending}
          placeholder={`e.g. "Hey, I'm Sarah Chen (sarah@example.com). I need a logo redesign, ideally by next Friday."`}
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400"
        />

        <div className="flex items-center justify-between gap-4 min-h-[2rem]">
          {feedback && (
            <p
              className={`text-sm ${
                feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {feedback.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="ml-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isPending ? 'Saving…' : 'Save Client'}
          </button>
        </div>
      </form>
    </div>
  )
}
