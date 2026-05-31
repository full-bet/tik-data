import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateItemField, deleteItem } from '../actions'
import TranscribeUpload from './TranscribeUpload'

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await supabase.from('items').select('*').eq('id', id).single()
  if (!item) notFound()

  // 最新スナップショット（xlsxインポートデータ）
  const { data: snapshot } = await supabase
    .from('analytics_snapshots')
    .select('views,likes,comments,shares,new_followers,gmv,direct_gmv,items_sold,ctr,completion_rate,duration,post_date,import_id')
    .eq('item_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/items" className="text-slate-400 hover:text-slate-600 text-sm">
          ← 投稿管理
        </Link>
      </div>

      {/* 動画情報 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-5">動画情報</h2>
        <div className="space-y-4">
          <SaveField itemId={id} field="video_title" label="動画タイトル" defaultValue={item.video_title} />
          <div className="grid grid-cols-2 gap-4">
            <SaveField itemId={id} field="video_url" label="動画URL" defaultValue={item.video_url ?? ''} placeholder="https://www.tiktok.com/@user/video/..." />
            <SaveField itemId={id} field="posted_at" label="投稿日時" defaultValue={item.posted_at ? item.posted_at.slice(0, 16) : ''} type="datetime-local" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SaveField itemId={id} field="category" label="カテゴリ" defaultValue={item.category ?? ''} placeholder="例: 商品紹介" />
            <SaveField itemId={id} field="hook" label="冒頭フック" defaultValue={item.hook ?? ''} placeholder="例: 〇〇な人は見て" />
          </div>
          {item.video_url && (
            <a href={item.video_url} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-indigo-600 hover:underline">
              TikTokで見る →
            </a>
          )}
        </div>
      </div>

      {/* 台本 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">台本</h2>
          <span className="text-xs text-slate-400">MP4をアップロードして自動生成</span>
        </div>
        <TranscribeUpload itemId={id} />
        <SaveTextarea itemId={id} field="script_content" defaultValue={item.script_content ?? ''} placeholder="台本の内容を入力、またはMP4をアップロードして自動生成..." />
      </div>

      {/* xlsxインポートデータ */}
      {snapshot && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">アナリティクス（最新インポート）</h2>
            <span className="text-xs text-slate-400">尺: {snapshot.duration ?? '—'}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: '再生数',        value: (snapshot.views ?? 0).toLocaleString() },
              { label: 'いいね',        value: (snapshot.likes ?? 0).toLocaleString() },
              { label: 'コメント',      value: (snapshot.comments ?? 0).toLocaleString() },
              { label: 'シェア',        value: (snapshot.shares ?? 0).toLocaleString() },
              { label: 'フォロワー増加', value: (snapshot.new_followers ?? 0).toLocaleString() },
              { label: '販売数',        value: (snapshot.items_sold ?? 0).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <p className="text-lg font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'CTR',          value: `${snapshot.ctr ?? 0}%` },
              { label: '完了率',       value: `${snapshot.completion_rate ?? 0}%` },
              { label: 'GMV',          value: `¥${Number(snapshot.gmv ?? 0).toLocaleString()}` },
              { label: 'Direct GMV',   value: `¥${Number(snapshot.direct_gmv ?? 0).toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-indigo-50 rounded-lg p-3">
                <p className="text-xs text-indigo-400 mb-0.5">{label}</p>
                <p className="text-lg font-bold text-indigo-700">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 指標 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <h2 className="font-semibold text-slate-800 mb-5">指標（手動入力）</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3">初動 72h</p>
            <div className="space-y-3">
              {[
                { field: 'initial_views',            label: '再生数' },
                { field: 'initial_likes',            label: 'いいね数' },
                { field: 'initial_followers_gained', label: 'フォロワー獲得数' },
                { field: 'initial_cv_count',         label: 'CV数' },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 whitespace-nowrap">{label}</span>
                  <SaveNumber itemId={id} field={field} defaultValue={item[field as keyof typeof item] as number ?? 0} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">累計</p>
            <div className="space-y-3">
              {[
                { field: 'views',            label: '再生数' },
                { field: 'likes',            label: 'いいね数' },
                { field: 'followers_gained', label: 'フォロワー獲得数' },
                { field: 'cv_count',         label: 'CV数' },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 whitespace-nowrap">{label}</span>
                  <SaveNumber itemId={id} field={field} defaultValue={item[field as keyof typeof item] as number ?? 0} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 削除 */}
      <div className="text-right">
        <DeleteButton id={id} />
      </div>
    </div>
  )
}

// ---- Server Action ベースの保存コンポーネント群 ----

function SaveField({ itemId, field, label, defaultValue, placeholder, type = 'text' }: {
  itemId: string; field: string; label: string; defaultValue: string; placeholder?: string; type?: string
}) {
  async function save(formData: FormData) {
    'use server'
    const value = formData.get(field) as string
    await updateItemField(itemId, field, value || null)
  }
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <form action={save} className="flex gap-2">
        <input
          type={type}
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

function SaveTextarea({ itemId, field, defaultValue, placeholder }: {
  itemId: string; field: string; defaultValue: string; placeholder?: string
}) {
  async function save(formData: FormData) {
    'use server'
    const value = formData.get(field) as string
    await updateItemField(itemId, field, value || null)
  }
  return (
    <form action={save}>
      <textarea
        name={field}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={10}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      <button type="submit" className="mt-2 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors">
        保存
      </button>
    </form>
  )
}

function SaveNumber({ itemId, field, defaultValue }: {
  itemId: string; field: string; defaultValue: number
}) {
  async function save(formData: FormData) {
    'use server'
    const raw = formData.get(field) as string
    await updateItemField(itemId, field, raw === '' ? null : Number(raw))
  }
  return (
    <form action={save} className="flex gap-1.5">
      <input
        type="number"
        name={field}
        defaultValue={defaultValue}
        className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button type="submit" className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition-colors">
        保存
      </button>
    </form>
  )
}

function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    'use server'
    await deleteItem(id)
  }
  return (
    <form action={handleDelete}>
      <button type="submit" className="text-sm text-red-400 hover:text-red-600 transition-colors">
        このアイテムを削除
      </button>
    </form>
  )
}
