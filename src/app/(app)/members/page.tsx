import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const ROLE_LABELS: Record<string, string> = {
  cast: 'キャスト',
  editor: '編集者',
  operator: '運用者',
  broker: '仲介者',
  shooter: '撮影者',
  reviewer: 'レビュアー',
  other: 'その他',
}

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('members')
    .select('id,name,memo,created_at,member_roles(role)')
    .order('created_at', { ascending: false })

  type MemberRow = {
    id: string
    name: string
    memo: string | null
    member_roles: { role: string }[] | null
  }
  const rows = (members ?? []) as unknown as MemberRow[]

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">社内メンバー</h1>
          <p className="text-neutral-500 text-sm mt-1">{rows.length}名</p>
        </div>
        <Link
          href="/members/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-16 text-center">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-neutral-400 font-medium">メンバーがまだ登録されていません</p>
          <Link
            href="/members/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初のメンバーを追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map(m => (
            <div key={m.id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
              <div className="flex items-start justify-between">
                <p className="font-semibold text-white">{m.name}</p>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {(m.member_roles ?? []).length === 0 ? (
                    <span className="inline-block px-2 py-0.5 bg-neutral-800 text-neutral-500 rounded text-xs font-medium">
                      役割未設定
                    </span>
                  ) : (
                    (m.member_roles ?? []).map((r, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium"
                      >
                        {ROLE_LABELS[r.role] ?? r.role}
                      </span>
                    ))
                  )}
                </div>
              </div>
              {m.memo && <p className="text-neutral-400 text-sm mt-3">{m.memo}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
