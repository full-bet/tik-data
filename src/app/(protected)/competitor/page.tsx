import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CompetitorPage() {
  const supabase = await createClient()

  const { data: videos } = await supabase
    .from('competitor_videos')
    .select('id,tiktok_url,title,account_name,category,script_content,created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">競合分析</h1>
          <p className="text-slate-500 text-sm mt-1">{videos?.length ?? 0}件</p>
        </div>
        <Link
          href="/competitor/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {!videos || videos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 sm:p-16 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-slate-600 font-medium">競合動画がまだありません</p>
          <p className="text-slate-400 text-sm mt-2">TikTok URLと台本をセットで記録しましょう</p>
          <Link
            href="/competitor/new"
            className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初の動画を追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {videos.map(video => (
            <Link
              key={video.id}
              href={`/competitor/${video.id}`}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {video.account_name && (
                      <span className="text-sm font-semibold text-slate-800">@{video.account_name}</span>
                    )}
                    {video.category && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                        {video.category}
                      </span>
                    )}
                  </div>
                  {video.title && (
                    <p className="text-slate-700 font-medium text-sm mb-1 truncate">{video.title}</p>
                  )}
                  <p className="text-slate-400 text-xs truncate">{video.tiktok_url}</p>
                  {video.script_content && (
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2">{video.script_content}</p>
                  )}
                </div>
                <div className="shrink-0 text-xs text-slate-400 whitespace-nowrap">
                  {new Date(video.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
