import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MaterialsPage() {
  const supabase = await createClient()

  const { data: materials } = await supabase
    .from('materials')
    .select('id,title,file_url,file_type,notes,created_at,members(name),deals(name)')
    .order('created_at', { ascending: false })

  type MaterialRow = {
    id: string
    title: string
    file_url: string | null
    file_type: string | null
    notes: string | null
    members: { name: string } | null
    deals: { name: string } | null
  }
  const rows = (materials ?? []) as unknown as MaterialRow[]

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">素材</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length}件</p>
        </div>
        <Link
          href="/materials/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <p className="text-4xl mb-4">🎞️</p>
          <p className="text-slate-600 font-medium">素材がまだ登録されていません</p>
          <Link
            href="/materials/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初の素材を追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{m.title}</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {[m.members?.name, m.deals?.name].filter(Boolean).join(' / ') || '—'}
                  </p>
                </div>
                {m.file_type && (
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium shrink-0">
                    {m.file_type}
                  </span>
                )}
              </div>
              {m.file_url && (
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-indigo-600 text-xs mt-2 hover:underline truncate max-w-full"
                >
                  {m.file_url}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
