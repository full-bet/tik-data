import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function TestsPage() {
  const supabase = await createClient()

  const { data: tests } = await supabase
    .from('tests')
    .select('id,name,what_how,win_condition,posted_at,created_at,deals(name)')
    .order('created_at', { ascending: false })

  type TestRow = {
    id: string
    name: string
    what_how: string | null
    win_condition: string | null
    posted_at: string | null
    deals: { name: string } | null
  }
  const rows = (tests ?? []) as unknown as TestRow[]

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">テスト</h1>
          <p className="text-neutral-500 text-sm mt-1">{rows.length}件</p>
        </div>
        <Link
          href="/tests/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-16 text-center">
          <p className="text-4xl mb-4">🧪</p>
          <p className="text-neutral-400 font-medium">テストがまだ登録されていません</p>
          <Link
            href="/tests/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初のテストを追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map(t => (
            <Link
              key={t.id}
              href={`/tests/${t.id}`}
              className="block bg-neutral-900 rounded-xl border border-neutral-800 p-5 hover:border-indigo-500/60 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-neutral-500 text-sm mt-1">{t.deals?.name ?? '商材未設定'}</p>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
                    t.posted_at ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {t.posted_at ? '投稿済み' : '進行中'}
                </span>
              </div>
              {t.what_how && <p className="text-neutral-400 text-sm mt-3 line-clamp-2">{t.what_how}</p>}
              {t.win_condition && (
                <p className="text-neutral-500 text-xs mt-2">勝利条件: {t.win_condition}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
