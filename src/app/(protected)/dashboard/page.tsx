import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { PostWithMetrics, ScriptAnalytics } from '@/types'

function computeMetrics(posts: PostWithMetrics[]) {
  let initialViews = 0, initialLikes = 0, initialComments = 0, initialShares = 0
  let totalViews = 0, totalLikes = 0, totalComments = 0, totalShares = 0

  for (const post of posts) {
    const metrics = post.post_metrics
    if (!metrics || metrics.length === 0) continue

    const sorted = [...metrics].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )

    if (post.posted_at) {
      const deadline = new Date(new Date(post.posted_at).getTime() + 72 * 60 * 60 * 1000)
      const initial = sorted.filter(m => new Date(m.recorded_at) <= deadline).pop()
      if (initial) {
        initialViews += initial.views || 0
        initialLikes += initial.likes || 0
        initialComments += initial.comments || 0
        initialShares += initial.shares || 0
      }
    }

    const latest = sorted[sorted.length - 1]
    if (latest) {
      totalViews += latest.views || 0
      totalLikes += latest.likes || 0
      totalComments += latest.comments || 0
      totalShares += latest.shares || 0
    }
  }

  return { initialViews, initialLikes, initialComments, initialShares, totalViews, totalLikes, totalComments, totalShares }
}

function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return n.toLocaleString()
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: scripts } = await supabase
    .from('scripts')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: postsRaw } = await supabase
    .from('posts')
    .select('*, post_metrics(*), accounts(tiktok_username, tiktok_display_name)')

  const posts: PostWithMetrics[] = (postsRaw ?? []) as PostWithMetrics[]

  const scriptAnalytics: ScriptAnalytics[] = (scripts ?? []).map(script => {
    const linked = posts.filter(p => p.script_id === script.id)
    const metrics = computeMetrics(linked)
    return { ...script, post_count: linked.length, ...metrics }
  })

  const totalViews = scriptAnalytics.reduce((s, a) => s + a.total_views, 0)
  const totalPosts = posts.length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>
          <p className="text-slate-500 text-sm mt-1">台本ごとの投稿パフォーマンス</p>
        </div>
        <Link
          href="/scripts/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 台本を作成
        </Link>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: '台本数', value: scripts?.length ?? 0, unit: '本' },
          { label: '投稿数', value: totalPosts, unit: '件' },
          { label: '総再生数', value: fmt(totalViews), unit: '' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-slate-500 text-xs font-medium">{label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {value}<span className="text-base font-normal text-slate-400 ml-1">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 台本分析テーブル */}
      {scriptAnalytics.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-slate-600 font-medium">台本がまだありません</p>
          <p className="text-slate-400 text-sm mt-2">台本を作成してTikTok投稿と紐付けましょう</p>
          <Link
            href="/scripts/new"
            className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初の台本を作成
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">台本別パフォーマンス</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-slate-500 font-medium">台本</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium">投稿数</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium" colSpan={3}>
                    初動 72h
                  </th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium" colSpan={3}>
                    累計
                  </th>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs">
                  <th className="px-6 py-2" />
                  <th className="px-4 py-2" />
                  <th className="text-right px-4 py-2 text-slate-400">再生</th>
                  <th className="text-right px-4 py-2 text-slate-400">いいね</th>
                  <th className="text-right px-4 py-2 text-slate-400">コメント</th>
                  <th className="text-right px-4 py-2 text-slate-400">再生</th>
                  <th className="text-right px-4 py-2 text-slate-400">いいね</th>
                  <th className="text-right px-4 py-2 text-slate-400">コメント</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scriptAnalytics.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/scripts/${s.id}`} className="hover:text-indigo-600">
                        <p className="font-medium text-slate-900">{s.title}</p>
                        {s.category && (
                          <p className="text-xs text-slate-400 mt-0.5">{s.category}</p>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-600">{s.post_count}</td>
                    <td className="px-4 py-4 text-right text-slate-700">{fmt(s.initial_views)}</td>
                    <td className="px-4 py-4 text-right text-slate-700">{fmt(s.initial_likes)}</td>
                    <td className="px-4 py-4 text-right text-slate-700">{fmt(s.initial_comments)}</td>
                    <td className="px-4 py-4 text-right font-medium text-slate-900">{fmt(s.total_views)}</td>
                    <td className="px-4 py-4 text-right text-slate-700">{fmt(s.total_likes)}</td>
                    <td className="px-4 py-4 text-right text-slate-700">{fmt(s.total_comments)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
