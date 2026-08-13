import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DealsPage() {
  const supabase = await createClient()

  const { data: deals } = await supabase
    .from('deals')
    .select('id,name,unit_price,characteristics,created_at,clients(name)')
    .order('created_at', { ascending: false })

  type DealRow = {
    id: string
    name: string
    unit_price: string | null
    characteristics: string | null
    clients: { name: string } | null
  }
  const rows = (deals ?? []) as unknown as DealRow[]

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">商材</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length}件</p>
        </div>
        <Link
          href="/deals/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <p className="text-4xl mb-4">💼</p>
          <p className="text-slate-600 font-medium">商材がまだ登録されていません</p>
          <Link
            href="/deals/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初の商材を追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{d.name}</p>
                  <p className="text-slate-500 text-sm mt-1">{d.clients?.name ?? '提供元法人未設定'}</p>
                </div>
                {d.unit_price && (
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium shrink-0">
                    単価 {d.unit_price}
                  </span>
                )}
              </div>
              {d.characteristics && (
                <p className="text-slate-600 text-sm mt-3 line-clamp-2">{d.characteristics}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
