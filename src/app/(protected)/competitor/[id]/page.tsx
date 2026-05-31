import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateCompetitorField, deleteCompetitorVideo } from '../actions'
import CompetitorTranscribeUpload from './CompetitorTranscribeUpload'

export default async function CompetitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: video } = await supabase
    .from('competitor_videos')
    .select('*')
    .eq('id', id)
    .single()

  if (!video) notFound()

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/competitor" className="text-slate-400 hover:text-slate-600 text-sm">
          ← 競合分析
        </Link>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-5">動画情報</h2>
        <div className="space-y-4">
          <EditField id={id} field="tiktok_url" label="TikTok URL" defaultValue={video.tiktok_url} placeholder="https://www.tiktok.com/@user/video/..." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField id={id} field="account_name" label="アカウント名" defaultValue={video.account_name ?? ''} placeholder="例: competitor_user" />
            <EditField id={id} field="category" label="カテゴリ" defaultValue={video.category ?? ''} placeholder="例: 商品紹介" />
          </div>
          <EditField id={id} field="title" label="タイトル・メモ" defaultValue={video.title ?? ''} placeholder="例: バズってる商品紹介パターン" />
          {video.tiktok_url && (
            <a
              href={video.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
            >
              TikTokで見る →
            </a>
          )}
        </div>
      </div>

      {/* 文字起こし台本 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">文字起こし台本</h2>
          <span className="text-xs text-slate-400">MP4をアップロードして自動生成</span>
        </div>
        <CompetitorTranscribeUpload videoId={id} />
        <EditTextarea id={id} field="script_content" defaultValue={video.script_content ?? ''} placeholder="台本の内容を入力、またはMP4をアップロードして自動生成..." />
      </div>

      {/* メモ */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-4">分析メモ</h2>
        <EditTextarea id={id} field="memo" defaultValue={video.memo ?? ''} placeholder="フック、構成、訴求のポイントなどを記録..." rows={5} />
      </div>

      {/* 削除 */}
      <div className="text-right">
        <DeleteButton id={id} />
      </div>
    </div>
  )
}

function EditField({ id, field, label, defaultValue, placeholder }: {
  id: string; field: string; label: string; defaultValue: string; placeholder?: string
}) {
  async function save(formData: FormData) {
    'use server'
    const value = formData.get(field) as string
    await updateCompetitorField(id, field, value || null)
  }
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <form action={save} className="flex gap-2">
        <input
          type="text"
          name={field}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition-colors">
          保存
        </button>
      </form>
    </div>
  )
}

function EditTextarea({ id, field, defaultValue, placeholder, rows = 10 }: {
  id: string; field: string; defaultValue: string; placeholder?: string; rows?: number
}) {
  async function save(formData: FormData) {
    'use server'
    const value = formData.get(field) as string
    await updateCompetitorField(id, field, value || null)
  }
  return (
    <form action={save}>
      <textarea
        name={field}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      <button type="submit" className="mt-2 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors">
        保存
      </button>
    </form>
  )
}

function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    'use server'
    await deleteCompetitorVideo(id)
  }
  return (
    <form action={handleDelete}>
      <button type="submit" className="text-sm text-red-400 hover:text-red-600 transition-colors">
        この動画を削除
      </button>
    </form>
  )
}
