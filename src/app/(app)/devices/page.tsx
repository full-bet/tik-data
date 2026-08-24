import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DevicesPage() {
  const supabase = await createClient()

  const { data: devices } = await supabase
    .from('devices')
    .select('id,name,owner_type,usage_note,created_at,members(name)')
    .order('created_at', { ascending: false })

  type DeviceRow = {
    id: string
    name: string
    owner_type: string | null
    usage_note: string | null
    members: { name: string } | null
  }
  const rows = (devices ?? []) as unknown as DeviceRow[]

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">端末登録</h1>
          <p className="text-neutral-500 text-sm mt-1">{rows.length}台</p>
        </div>
        <Link
          href="/devices/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-16 text-center">
          <p className="text-4xl mb-4">📱</p>
          <p className="text-neutral-400 font-medium">端末がまだ登録されていません</p>
          <Link
            href="/devices/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初の端末を追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map(d => (
            <Link
              key={d.id}
              href={`/devices/${d.id}`}
              className="block bg-neutral-900 rounded-xl border border-neutral-800 p-5 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{d.name}</p>
                  <p className="text-neutral-500 text-sm mt-1">{d.members?.name ?? '担当者未設定'}</p>
                </div>
                {d.owner_type && (
                  <span className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium shrink-0">
                    {d.owner_type === 'personal' ? '個人端末' : d.owner_type === 'company' ? '会社支給' : d.owner_type}
                  </span>
                )}
              </div>
              {d.usage_note && <p className="text-neutral-400 text-sm mt-2">{d.usage_note}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
