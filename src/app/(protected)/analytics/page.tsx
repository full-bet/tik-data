import { createClient } from '@/lib/supabase/server'
import UploadForm from './UploadForm'
import { TrendChart, RankingChart } from './Charts'
import AiSummary from './AiSummary'

function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return n.toLocaleString()
}

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: imports } = await supabase
    .from('analytics_imports')
    .select('id,filename,imported_at,row_count,status')
    .eq('status', 'done')
    .order('imported_at', { ascending: false })
    .limit(30)

  const latestImport = imports?.[0]

  // Snapshots from latest import for KPI + ranking
  const { data: latestSnapshots } = latestImport
    ? await supabase
        .from('analytics_snapshots')
        .select('video_title,views,likes,comments,shares,reach,new_followers')
        .eq('import_id', latestImport.id)
        .order('views', { ascending: false })
    : { data: null }

  // Trend data: one aggregate row per import
  const trendData = await Promise.all(
    (imports ?? []).slice(0, 10).reverse().map(async imp => {
      const { data } = await supabase
        .from('analytics_snapshots')
        .select('views,likes,new_followers')
        .eq('import_id', imp.id)
      const views = (data ?? []).reduce((s, r) => s + (r.views ?? 0), 0)
      const likes = (data ?? []).reduce((s, r) => s + (r.likes ?? 0), 0)
      const new_followers = (data ?? []).reduce((s, r) => s + (r.new_followers ?? 0), 0)
      return {
        date: new Date(imp.imported_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        views,
        likes,
        new_followers,
      }
    })
  )

  // KPI from latest import
  const totalViews      = (latestSnapshots ?? []).reduce((s, r) => s + (r.views ?? 0), 0)
  const totalLikes      = (latestSnapshots ?? []).reduce((s, r) => s + (r.likes ?? 0), 0)
  const totalFollowers  = (latestSnapshots ?? []).reduce((s, r) => s + (r.new_followers ?? 0), 0)
  const engagementRate  = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : '0.0'

  // Top 10 for ranking
  const rankingData = (latestSnapshots ?? []).slice(0, 10).map(r => ({
    video_title: r.video_title,
    views: r.views ?? 0,
    likes: r.likes ?? 0,
    engagement: r.views ? `${((r.likes / r.views) * 100).toFixed(1)}%` : '—',
  }))

  const kpiCards = [
    { label: '合計再生数', value: fmt(totalViews), icon: '▶' },
    { label: '合計いいね', value: fmt(totalLikes), icon: '♥' },
    { label: 'フォロワー増加', value: fmt(totalFollowers), icon: '👥' },
    { label: 'エンゲージメント率', value: `${engagementRate}%`, icon: '📈' },
  ]

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">アナリティクス</h1>
          <p className="text-slate-500 text-sm mt-1">
            {latestImport
              ? `最終インポート: ${new Date(latestImport.imported_at).toLocaleDateString('ja-JP')} — ${latestImport.row_count}件`
              : 'インポート履歴なし'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: upload + history */}
        <div className="space-y-4">
          <UploadForm />

          {(imports?.length ?? 0) > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">インポート履歴</h3>
              <ul className="space-y-2">
                {imports!.map(imp => (
                  <li key={imp.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 truncate max-w-[150px]">{imp.filename}</span>
                    <span className="text-slate-400">
                      {new Date(imp.imported_at).toLocaleDateString('ja-JP')} · {imp.row_count}件
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: KPI + charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI cards */}
          {latestImport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpiCards.map(k => (
                <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-slate-400 text-xs">{k.icon} {k.label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{k.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Trend chart */}
          {trendData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-700 mb-4">インポート別トレンド</h2>
              <TrendChart data={trendData} />
            </div>
          )}

          {/* AI Summary */}
          {latestImport && <AiSummary importId={latestImport.id} />}

          {/* Ranking */}
          {rankingData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-700 mb-4">再生数ランキング（最新インポート）</h2>
              <RankingChart data={rankingData} />
              <div className="overflow-x-auto">
              <table className="w-full text-xs mt-4">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">タイトル</th>
                    <th className="pb-2 text-right font-medium">再生</th>
                    <th className="pb-2 text-right font-medium">いいね</th>
                    <th className="pb-2 text-right font-medium">EG率</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 text-slate-400">{i + 1}</td>
                      <td className="py-2 text-slate-700 max-w-[200px] truncate">{r.video_title ?? '—'}</td>
                      <td className="py-2 text-right text-slate-900 font-medium">{fmt(r.views)}</td>
                      <td className="py-2 text-right text-slate-600">{fmt(r.likes)}</td>
                      <td className="py-2 text-right text-slate-500">{r.engagement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {!latestImport && (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-slate-600 font-medium">まだデータがありません</p>
              <p className="text-slate-400 text-sm mt-1">左のフォームからxlsxをインポートしてください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
