'use client'

import { useState, useTransition } from 'react'
import {
  Search,
  Pencil,
  Trash2,
  MessageSquare,
  Copy,
  Check,
  X,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import {
  updateClientStatus,
  updateClient,
  deleteClient,
  generateFollowUp,
} from '@/app/dashboard/actions'

export type Client = {
  id: string
  name: string
  email: string | null
  service_requested: string
  date_requested: string | null
  raw_text: string
  created_at: string
  status: string
}

const STATUS = [
  { value: 'new', label: 'New', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'contacted', label: 'Contacted', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'closed', label: 'Closed', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
] as const

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function StatusPill({ id, value }: { id: string; value: string }) {
  const [current, setCurrent] = useState(value)
  const [isPending, startTransition] = useTransition()
  const config = STATUS.find((s) => s.value === current) ?? STATUS[0]

  return (
    <div className="relative inline-flex items-center">
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value
          setCurrent(next)
          startTransition(() => updateClientStatus(id, next))
        }}
        className={`appearance-none pl-2.5 pr-6 py-1 text-xs font-medium rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400 transition ${config.pill} ${isPending ? 'opacity-50' : ''}`}
      >
        {STATUS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <ChevronDown size={10} className="absolute right-1.5 pointer-events-none opacity-50" />
    </div>
  )
}

type FollowUpEntry = { loading: boolean; text: string | null; copied: boolean }

export default function ClientTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Omit<Client, 'id' | 'raw_text' | 'created_at' | 'status'>>({
    name: '', email: '', service_requested: '', date_requested: '',
  })
  const [followUps, setFollowUps] = useState<Record<string, FollowUpEntry>>({})
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()
  const [savePending, setSavePending] = useState(false)

  const visible = clients.filter((c) => {
    if (hidden.has(c.id)) return false
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      c.service_requested.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  function startEdit(c: Client) {
    setEditingId(c.id)
    setEditDraft({
      name: c.name,
      email: c.email ?? '',
      service_requested: c.service_requested,
      date_requested: c.date_requested ?? '',
    })
  }

  async function saveEdit(id: string) {
    setSavePending(true)
    try {
      await updateClient(id, {
        name: editDraft.name,
        email: editDraft.email || null,
        service_requested: editDraft.service_requested,
        date_requested: editDraft.date_requested || null,
      })
      setEditingId(null)
    } finally {
      setSavePending(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this client? This cannot be undone.')) return
    setHidden((prev) => new Set([...prev, id]))
    try {
      await deleteClient(id)
    } catch {
      setHidden((prev) => { const n = new Set(prev); n.delete(id); return n })
    }
  }

  async function handleFollowUp(client: Client) {
    const existing = followUps[client.id]
    if (existing && !existing.loading) {
      setFollowUps((prev) => { const n = { ...prev }; delete n[client.id]; return n })
      return
    }
    setFollowUps((prev) => ({ ...prev, [client.id]: { loading: true, text: null, copied: false } }))
    try {
      const text = await generateFollowUp(client.raw_text, client.name)
      setFollowUps((prev) => ({ ...prev, [client.id]: { loading: false, text, copied: false } }))
    } catch {
      setFollowUps((prev) => { const n = { ...prev }; delete n[client.id]; return n })
    }
  }

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text)
    setFollowUps((prev) => ({ ...prev, [id]: { ...prev[id], copied: true } }))
    setTimeout(
      () => setFollowUps((prev) => ({ ...prev, [id]: { ...prev[id], copied: false } })),
      2000
    )
  }

  const inputCls =
    'w-full px-2.5 py-1.5 text-sm rounded-md border border-violet-300 bg-violet-50/40 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent'

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Clients</h2>
          <p className="text-xs text-slate-400 mt-0.5">{visible.length} record{visible.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-2.5 sm:ml-auto">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition w-44"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition cursor-pointer"
            >
              <option value="all">All status</option>
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-400 text-sm">
            {clients.length === 0
              ? 'No clients yet. Use Magic Input above to add your first one.'
              : 'No clients match your search.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {['Name', 'Email', 'Service', 'Status', 'Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((client) => {
                const isEditing = editingId === client.id
                const fu = followUps[client.id]

                return (
                  <>
                    <tr
                      key={client.id}
                      className={`transition-colors ${isEditing ? 'bg-violet-50/40' : 'hover:bg-slate-50/60'}`}
                    >
                      {/* Name */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            value={editDraft.name}
                            onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                            className={inputCls}
                          />
                        ) : (
                          <span className="font-semibold text-slate-900">{client.name}</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            value={editDraft.email ?? ''}
                            onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
                            placeholder="none"
                            className={inputCls}
                          />
                        ) : (
                          <span className="text-slate-500">
                            {client.email ?? <span className="text-slate-300">—</span>}
                          </span>
                        )}
                      </td>

                      {/* Service */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <input
                            value={editDraft.service_requested}
                            onChange={(e) => setEditDraft((d) => ({ ...d, service_requested: e.target.value }))}
                            className={inputCls}
                          />
                        ) : (
                          <span className="text-slate-700">{client.service_requested}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusPill id={client.id} value={client.status} />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editDraft.date_requested ?? ''}
                            onChange={(e) => setEditDraft((d) => ({ ...d, date_requested: e.target.value }))}
                            className={inputCls}
                          />
                        ) : (
                          <span className="text-slate-500">{fmt(client.date_requested)}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => saveEdit(client.id)}
                              disabled={savePending}
                              title="Save"
                              className="p-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition disabled:opacity-50"
                            >
                              {savePending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              title="Cancel"
                              className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startEdit(client)}
                              title="Edit"
                              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleFollowUp(client)}
                              title={fu ? 'Close reply' : 'Draft reply'}
                              className={`p-1.5 rounded-md transition ${
                                fu
                                  ? 'text-violet-600 bg-violet-100 hover:bg-violet-200'
                                  : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'
                              }`}
                            >
                              <MessageSquare size={14} />
                            </button>
                            <button
                              onClick={() => startTransition(() => handleDelete(client.id))}
                              title="Delete"
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Follow-up expandable row */}
                    {fu && (
                      <tr key={`${client.id}-fu`} className="bg-violet-50/50">
                        <td colSpan={6} className="px-5 pb-4 pt-2">
                          <div className="rounded-lg border border-violet-200/60 bg-white p-4">
                            <div className="flex items-center justify-between mb-2.5">
                              <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
                                AI-drafted reply
                              </p>
                              {fu.text && (
                                <button
                                  onClick={() => copyText(client.id, fu.text!)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
                                >
                                  {fu.copied ? (
                                    <><Check size={12} className="text-emerald-500" /> Copied</>
                                  ) : (
                                    <><Copy size={12} /> Copy</>
                                  )}
                                </button>
                              )}
                            </div>
                            {fu.loading ? (
                              <div className="flex items-center gap-2 text-slate-400 text-sm py-1">
                                <Loader2 size={14} className="animate-spin" />
                                Drafting reply…
                              </div>
                            ) : (
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {fu.text}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
