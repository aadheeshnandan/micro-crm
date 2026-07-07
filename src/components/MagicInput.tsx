'use client'

import { useState, useTransition } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
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
        setFeedback({ type: 'success', message: `"${result.clientName}" saved.` })
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Something went wrong.',
        })
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-center w-7 h-7 bg-violet-100 rounded-lg">
          <Sparkles size={14} className="text-violet-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Magic Input</h2>
          <p className="text-xs text-slate-400">
            Paste a client message — AI extracts and saves their info
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isPending}
          placeholder={`e.g. "Hi, I'm James (james@studio.io). Looking for a brand refresh — new logo and color palette. Would love to start by end of August."`}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-slate-50/50 disabled:opacity-60"
        />

        <div className="flex items-center justify-between gap-4 min-h-[2rem]">
          {feedback ? (
            <p
              className={`text-sm font-medium ${
                feedback.type === 'success' ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {feedback.type === 'success' ? '✓ ' : ''}
              {feedback.message}
            </p>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="ml-auto inline-flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-sm font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Save Client
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
