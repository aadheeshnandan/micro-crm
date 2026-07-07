import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import MagicInput from '@/components/MagicInput'
import ClientTable from '@/components/ClientTable'
import StatsBar from '@/components/StatsBar'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: clients }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('clients')
      .select('id, name, email, service_requested, date_requested, raw_text, created_at, status')
      .order('created_at', { ascending: false }),
  ])

  const safeClients = clients ?? []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 bg-violet-600 rounded-lg">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm tracking-tight">Micro CRM</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:block">{user?.email}</span>
            <form action={signout}>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {safeClients.length === 0
              ? 'Get started by adding your first client below.'
              : `Managing ${safeClients.length} client${safeClients.length !== 1 ? 's' : ''}.`}
          </p>
        </div>

        <StatsBar clients={safeClients} />
        <MagicInput />
        <ClientTable clients={safeClients} />
      </main>
    </div>
  )
}
