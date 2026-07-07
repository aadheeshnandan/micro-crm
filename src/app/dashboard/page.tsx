import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import MagicInput from '@/components/MagicInput'
import ClientTable from '@/components/ClientTable'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: clients }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('clients')
      .select('id, name, email, service_requested, date_requested, raw_text, created_at')
      .order('created_at', { ascending: false }),
  ])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
          </div>
          <form action={signout}>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>

        <MagicInput />
        <ClientTable clients={clients ?? []} />
      </div>
    </main>
  )
}
