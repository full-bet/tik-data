import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ScriptsPage() {
  const supabase = await createClient()

  const { data: scripts } = await supabase
    .from('scripts')
    .select('*, items(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">台本一覧</h1>
          <p className="text-neutral-500 text-sm mt-1">{scripts?.length ?? 0}本の台本</p>
        </div>
        <Link
          href="/scripts/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 台本を作成
        </Link>
      </div>

      {!scripts || scripts.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-16 text-center">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-neutral-400 font-medium">台本がまだありません</p>
          <Link
            href="/scripts/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初の台本を作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {scripts.map(script => (
            <Link
              key={script.id}
              href={`/scripts/${script.id}`}
              className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 hover:border-indigo-500/60 hover:shadow-sm transition-all flex items-start justify-between"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{script.title}</p>
                {script.hook && (
                  <p className="text-neutral-500 text-sm mt-1 truncate">フック: {script.hook}</p>
                )}
                {script.category && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium">
                    {script.category}
                  </span>
                )}
              </div>
              <div className="ml-4 text-right shrink-0">
                <p className="text-2xl font-bold text-white">
                  {(script.items as unknown as { count: number }[])?.[0]?.count ?? 0}
                </p>
                <p className="text-xs text-neutral-500">投稿</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
