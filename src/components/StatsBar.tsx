import { Users, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'

type Client = {
  created_at: string
  date_requested: string | null
  status: string
}

function computeStats(clients: Client[]) {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const newThisWeek = clients.filter(
    (c) => new Date(c.created_at) >= weekAgo
  ).length

  const upcoming = clients.filter((c) => {
    if (!c.date_requested || c.status === 'closed') return false
    const d = new Date(c.date_requested + 'T00:00:00Z')
    return d >= now && d <= nextWeek
  }).length

  const open = clients.filter((c) => c.status !== 'closed').length

  return { total: clients.length, newThisWeek, upcoming, open }
}

type Stat = {
  label: string
  value: number
  icon: React.ElementType
  iconColor: string
  iconBg: string
  suffix?: string
}

export default function StatsBar({ clients }: { clients: Client[] }) {
  const { total, newThisWeek, upcoming, open } = computeStats(clients)

  const stats: Stat[] = [
    {
      label: 'Total Clients',
      value: total,
      icon: Users,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
    {
      label: 'New This Week',
      value: newThisWeek,
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Upcoming Deadlines',
      value: upcoming,
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      suffix: 'next 7 days',
    },
    {
      label: 'Open',
      value: open,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      suffix: 'not closed',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, iconColor, iconBg, suffix }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-slate-200/60 shadow-sm px-5 py-4 flex items-center gap-4"
        >
          <div className={`${iconBg} rounded-lg p-2.5 shrink-0`}>
            <Icon size={18} className={iconColor} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
            <p className="text-xs text-slate-500 mt-1 leading-tight">{label}</p>
            {suffix && (
              <p className="text-[10px] text-slate-400 mt-0.5">{suffix}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
