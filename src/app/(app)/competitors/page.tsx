import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AddCompetitorForm from './AddCompetitorForm'

export default async function CompetitorsPage() {
  const supabase = await createClient()
  const { data: competitors } = await supabase
    .from('competitors')
    .select('id,url,video_title,creator_name,thumbnail_url,transcript,ai_summary,created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">競合分析</h1>
          <p className="text-slate-500 text-sm mt-1">{competitors?.length ?? 0}件</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* URL追加フォーム */}
        <div className="lg:col-span-1">
          <AddCompetitorForm />
        </div>

        {/* 一覧 */}
        <div className="lg:col-span-2 space-y-3">
          {competitors?.length === 0 && (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-slate-500 text-sm">競合動画のURLを追加してください</p>
            </div>
          )}
          {competitors?.map(c => (
            <Link
              key={c.id}
              href={`/competitors/${c.id}`}
              className="flex gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              {c.thumbnail_url ? (
                <img src={c.thumbnail_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🎵</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm truncate">
                  {c.video_title ?? c.url}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{c.creator_name ?? '—'}</p>
                {c.ai_summary ? (
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{c.ai_summary}</p>
                ) : c.transcript ? (
                  <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1.5">
                    文字起こし済
                  </span>
                ) : (
                  <span className="inline-block text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full mt-1.5">
                    未処理
                  </span>
                )}
              </div>
              <span className="text-slate-300 text-sm self-center">›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
