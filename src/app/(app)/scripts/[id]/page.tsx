import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { extractVideoId } from '@/lib/tiktok/api'
import { DeleteScriptButton } from './DeleteScriptButton'

async function updateScript(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('scripts').update({
    title: formData.get('title') as string,
    content: (formData.get('content') as string) || null,
    category: (formData.get('category') as string) || null,
    hook: (formData.get('hook') as string) || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  redirect(`/scripts/${id}?saved=1`)
}

async function deleteScript(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('scripts').delete().eq('id', id)
  redirect('/scripts')
}

async function linkItem(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const scriptId = formData.get('script_id') as string
  const videoInput = formData.get('video_input') as string
  const accountId = formData.get('account_id') as string
  const postedAt = formData.get('posted_at') as string

  const videoId = extractVideoId(videoInput)
  if (!videoId) redirect(`/scripts/${scriptId}?error=invalid_video_id`)

  const { data: existing } = await supabase
    .from('items')
    .select('id')
    .eq('tiktok_video_id', videoId)
    .maybeSingle()

  if (existing) {
    await supabase.from('items').update({
      script_id: scriptId,
      account_id: accountId,
      posted_at: postedAt || null,
      updated_at: new Date().toISOString(),
    }).eq('id', existing.id)
  } else {
    await supabase.from('items').insert({
      script_id: scriptId,
      account_id: accountId,
      tiktok_video_id: videoId,
      video_title: `動画 ${videoId}`,
      posted_at: postedAt || null,
    })
  }

  redirect(`/scripts/${scriptId}?linked=1`)
}

function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return n.toLocaleString()
}

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: script }, { data: items }, { data: accounts }] = await Promise.all([
    supabase.from('scripts').select('*').eq('id', id).single(),
    supabase.from('items')
      .select('id, tiktok_video_id, posted_at, views, likes, initial_views, initial_likes, accounts(tiktok_username, tiktok_display_name)')
      .eq('script_id', id)
      .order('posted_at', { ascending: false }),
    supabase.from('accounts').select('id, tiktok_username, tiktok_display_name'),
  ])

  if (!script) notFound()

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/scripts" className="text-neutral-500 hover:text-white text-sm">
          ← 台本一覧
        </Link>
      </div>

      {/* 台本編集 */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-6">
        <h2 className="font-semibold text-neutral-200 mb-5">台本を編集</h2>
        <form action={updateScript} className="space-y-4">
          <input type="hidden" name="id" value={id} />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">タイトル</label>
            <input
              name="title"
              defaultValue={script.title}
              required
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">冒頭フック</label>
              <input
                name="hook"
                defaultValue={script.hook ?? ''}
                className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">カテゴリ</label>
              <input
                name="category"
                defaultValue={script.category ?? ''}
                className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">台本内容</label>
            <textarea
              name="content"
              defaultValue={script.content ?? ''}
              rows={8}
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors"
            >
              保存する
            </button>
            <form action={deleteScript}>
              <input type="hidden" name="id" value={id} />
              <DeleteScriptButton />
            </form>
          </div>
        </form>
      </div>

      {/* 動画紐付け */}
      {accounts && accounts.length > 0 && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-6">
          <h2 className="font-semibold text-neutral-200 mb-4">動画を紐付ける</h2>
          <form action={linkItem} className="space-y-4">
            <input type="hidden" name="script_id" value={id} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">アカウント</label>
                <select
                  name="account_id"
                  required
                  className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      @{a.tiktok_username ?? a.tiktok_display_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">投稿日時</label>
                <input
                  type="datetime-local"
                  name="posted_at"
                  className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                動画URLまたは動画ID
              </label>
              <input
                name="video_input"
                required
                className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="https://www.tiktok.com/@user/video/1234567890 または 1234567890"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              紐付ける
            </button>
          </form>
        </div>
      )}

      {/* 紐付き投稿一覧 */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-200">紐付き投稿 ({items?.length ?? 0}件)</h2>
        </div>

        {!items || items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-neutral-500 text-sm">まだ動画が紐付けられていません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-black">
                  <th className="text-left px-6 py-3 text-neutral-500 font-medium whitespace-nowrap">動画ID</th>
                  <th className="text-left px-4 py-3 text-neutral-500 font-medium whitespace-nowrap">投稿日</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium whitespace-nowrap">初動72h再生</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium whitespace-nowrap">初動いいね</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium whitespace-nowrap">累計再生</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium whitespace-nowrap">累計いいね</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <a
                        href={`https://www.tiktok.com/@_/video/${item.tiktok_video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-300 hover:underline font-mono text-xs"
                      >
                        {item.tiktok_video_id}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-neutral-500">
                      {item.posted_at ? new Date(item.posted_at).toLocaleDateString('ja-JP') : '—'}
                    </td>
                    <td className="px-4 py-4 text-right text-neutral-300">{fmt(item.initial_views ?? 0)}</td>
                    <td className="px-4 py-4 text-right text-neutral-300">{fmt(item.initial_likes ?? 0)}</td>
                    <td className="px-4 py-4 text-right font-medium text-white">{fmt(item.views ?? 0)}</td>
                    <td className="px-4 py-4 text-right text-neutral-300">{fmt(item.likes ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
