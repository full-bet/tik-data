import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CastsPage() {
  const supabase = await createClient()

  const { data: casts } = await supabase
    .from('cast_profiles')
    .select('member_id,age,gender,exposure_range,ng_notes,contact_method,members!cast_profiles_member_id_members_id_fk(name,memo)')
    .order('created_at', { ascending: false })

  type CastRow = {
    member_id: string
    age: number | null
    gender: string | null
    exposure_range: string | null
    ng_notes: string | null
    contact_method: string | null
    members: { name: string; memo: string | null } | null
  }
  const rows = (casts ?? []) as unknown as CastRow[]

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">キャスト</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length}名</p>
        </div>
        <Link
          href="/casts/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <p className="text-4xl mb-4">🧑</p>
          <p className="text-slate-600 font-medium">キャストがまだ登録されていません</p>
          <Link
            href="/casts/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初のキャストを追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map(c => (
            <div
              key={c.member_id}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{c.members?.name ?? '(無題)'}</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {[c.age ? `${c.age}歳` : null, c.gender].filter(Boolean).join(' / ') || '—'}
                  </p>
                </div>
                {c.contact_method && (
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium shrink-0">
                    連絡: {c.contact_method}
                  </span>
                )}
              </div>
              {c.exposure_range && (
                <p className="text-slate-600 text-sm mt-3">露出可能範囲: {c.exposure_range}</p>
              )}
              {c.ng_notes && (
                <p className="text-red-500 text-sm mt-1">NG: {c.ng_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
