'use client'

import { useState, useActionState } from 'react'
import { login, signup, tryAnonymously } from '@/app/auth/actions'

const initial = { error: null }

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loginState, loginAction, loginPending] = useActionState(login, initial)
  const [signupState, signupAction, signupPending] = useActionState(signup, initial)
  const [tryState, tryAction, tryPending] = useActionState(tryAnonymously, initial)

  const isLogin = mode === 'login'
  const action = isLogin ? loginAction : signupAction
  const error = isLogin ? loginState?.error : signupState?.error
  const pending = isLogin ? loginPending : signupPending

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle dot-grid background */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Violet glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-violet-600 rounded-xl shadow-lg shadow-violet-900/50 mb-4">
            <span className="text-white font-bold text-lg tracking-tight">M</span>
          </div>
          <h1 className="text-white text-2xl font-semibold tracking-tight">Micro CRM</h1>
          <p className="text-slate-500 text-sm mt-1">Client management, simplified</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-7">
          {/* Pill toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1 mb-6 gap-1">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === m
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-lg">
                <span className="text-red-500 mt-px shrink-0">⚠</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed mt-1"
            >
              {pending
                ? isLogin
                  ? 'Signing in…'
                  : 'Creating account…'
                : isLogin
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form action={tryAction}>
            {tryState?.error && (
              <div className="flex items-start gap-2.5 p-3 mb-3 bg-red-50 border border-red-100 rounded-lg">
                <span className="text-red-500 mt-px shrink-0">⚠</span>
                <p className="text-sm text-red-600">{tryState.error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={tryPending}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {tryPending ? 'Setting up…' : 'Try it out — no account needed'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Micro CRM · Built with Next.js & Supabase
        </p>
      </div>
    </div>
  )
}
