import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TranscribePanel from './TranscribePanel'
import AnalyzePanel from './AnalyzePanel'
import { updateCompetitorField, deleteCompetitor } from './actions'

export default async function CompetitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: comp } = await supabase
    .from('competitors')
    .select('*')
    .eq('id', id)
    .single()

  if (!comp) notFound()

  let structure: string[] = []
  try { structure = JSON.parse(comp.structure ?? '[]') } catch { structure = [] }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/competitors" className="text-neutral-500 hover:text-white text-sm">
          ← 競合分析
        </Link>
      </div>

      {/* 動画情報 */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-5">
        <div className="flex gap-4">
          {comp.thumbnail_url ? (
            <img src={comp.thumbnail_url} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 text-3xl">
              🎵
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white leading-snug">
              {comp.video_title ?? '（タイトル未取得）'}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">{comp.creator_name ?? '—'}</p>
            <a
              href={comp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:underline mt-1 inline-block"
            >
              TikTokで見る →
            </a>
          </div>
        </div>
      </div>

      {/* 文字起こし */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-5">
        <h2 className="font-semibold text-neutral-200 mb-4">文字起こし（Whisper）</h2>
        <TranscribePanel competitorId={id} currentTranscript={comp.transcript ?? ''} />
      </div>

      {/* AI構成分析 */}
      {comp.transcript && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-5">
          <h2 className="font-semibold text-neutral-200 mb-4">AI 構成分析</h2>
          <AnalyzePanel competitorId={id} hasAnalysis={!!comp.ai_summary} />

          {comp.ai_summary && (
            <div className="mt-5 space-y-4">
              {/* サマリー */}
              <div className="bg-indigo-500/10 rounded-lg p-4">
                <p className="text-xs font-semibold text-indigo-400 mb-1">まとめ</p>
                <p className="text-sm text-indigo-900">{comp.ai_summary}</p>
              </div>

              {/* フック / CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {comp.hook && (
                  <div className="bg-amber-500/10 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-400 mb-1">🪝 冒頭フック</p>
                    <p className="text-sm text-amber-900">{comp.hook}</p>
                  </div>
                )}
                {comp.cta && (
                  <div className="bg-green-500/10 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-400 mb-1">📣 CTA</p>
                    <p className="text-sm text-green-900">{comp.cta}</p>
                  </div>
                )}
              </div>

              {/* 構成 */}
              {structure.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-2">📋 構成</p>
                  <ol className="space-y-1">
                    {structure.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm text-neutral-300">
                        <span className="text-neutral-500 w-5 shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 手動メモ */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-5">
        <h2 className="font-semibold text-neutral-200 mb-3">メモ</h2>
        <NotesForm competitorId={id} defaultValue={comp.notes ?? ''} />
      </div>

      {/* 削除 */}
      <div className="text-right">
        <DeleteButton id={id} />
      </div>
    </div>
  )
}

function NotesForm({ competitorId, defaultValue }: { competitorId: string; defaultValue: string }) {
  async function save(formData: FormData) {
    'use server'
    await updateCompetitorField(competitorId, 'notes', formData.get('notes') as string)
  }
  return (
    <form action={save}>
      <textarea
        name="notes"
        defaultValue={defaultValue}
        rows={4}
        placeholder="気になった点、参考にしたい表現など..."
        className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      <button
        type="submit"
        className="mt-2 px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-white/10 transition-colors"
      >
        保存
      </button>
    </form>
  )
}

function DeleteButton({ id }: { id: string }) {
  async function handle() {
    'use server'
    await deleteCompetitor(id)
  }
  return (
    <form action={handle}>
      <button type="submit" className="text-sm text-red-400 hover:text-red-300 transition-colors">
        削除
      </button>
    </form>
  )
}
