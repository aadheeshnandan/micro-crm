type Client = {
  id: string
  name: string
  email: string | null
  service_requested: string
  date_requested: string | null
  raw_text: string
  created_at: string
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function truncate(text: string, max = 72): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…'
}

export default function ClientTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-sm text-gray-400">
          No clients yet. Use Magic Input above to add your first one.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
        <p className="text-sm text-gray-500 mt-0.5">{clients.length} total</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-6 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                Name
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                Email
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                Service
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                Date Requested
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">
                Message Snippet
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gray-50/60 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {client.name}
                </td>
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  {client.email ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                  {client.service_requested}
                </td>
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  {formatDate(client.date_requested)}
                </td>
                <td className="px-6 py-4 text-gray-400 max-w-xs">
                  {truncate(client.raw_text)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
