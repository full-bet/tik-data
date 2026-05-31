import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { extractVideoId } from '@/lib/tiktok/api'

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

async function linkPost(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const scriptId = formData.get('script_id') as string
  const videoInput = formData.get('video_input') as string
  const accountId = formData.get('account_id') as string
  const postedAt = formData.get('posted_at') as string

  const videoId = extractVideoId(videoInput)
  if (!videoId) redirect(`/scripts/${scriptId}?error=invalid_video_id`)

  await supabase.from('posts').insert({
    user_id: user.id,
    script_id: scriptId,
    account_id: accountId,
    tiktok_video_id: videoId,
    posted_at: postedAt || null,
  })

  redirect(`/scripts/${scriptId}?linked=1`)
}

function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return n.toLocaleString()
}

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: script }, { data: posts }, { data: accounts }] = await Promise.all([
    supabase.from('scripts').select('*').eq('id', id).single(),
    supabase.from('posts')
      .select('*, post_metrics(*), accounts(tiktok_username, tiktok_display_name)')
      .eq('script_id', id)
      .order('posted_at', { ascending: false }),
    supabase.from('accounts').select('id, tiktok_username, tiktok_display_name'),
  ])

  if (!script) notFound()

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/scripts" className="text-slate-400 hover:text-slate-600 text-sm">
          ← 台本一覧
        </Link>
      </div>

      {/* 台本編集 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-5">台本を編集</h2>
        <form action={updateScript} className="space-y-4">
          <input type="hidden" name="id" value={id} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">タイトル</label>
            <input
              name="title"
              defaultValue={script.title}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">冒頭フック</label>
              <input
                name="hook"
                defaultValue={script.hook ?? ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">カテゴリ</label>
              <input
                name="category"
                defaultValue={script.category ?? ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">台本内容</label>
            <textarea
              name="content"
              defaultValue={script.content ?? ''}
              rows={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              保存する
            </button>
            <form action={deleteScript}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="px-4 py-2 text-red-500 hover:text-red-700 text-sm"
                onClick={e => !confirm('この台本を削除しますか？') && e.preventDefault()}
              >
                削除
              </button>
            </form>
          </div>
        </form>
      </div>

      {/* 動画紐付け */}
      {accounts && accounts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">動画を紐付ける</h2>
          <form action={linkPost} className="space-y-4">
            <input type="hidden" name="script_id" value={id} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">TikTokアカウント</label>
                <select
                  name="account_id"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      @{a.tiktok_username ?? a.tiktok_display_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">投稿日時</label>
                <input
                  type="datetime-local"
                  name="posted_at"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                動画URLまたは動画ID
              </label>
              <input
                name="video_input"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://www.tiktok.com/@user/video/1234567890 または 1234567890"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
            >
              紐付ける
            </button>
          </form>
        </div>
      )}

      {/* 紐付き投稿一覧 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">紐付き投稿 ({posts?.length ?? 0}件)</h2>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">まだ動画が紐付けられていません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-slate-500 font-medium">動画ID</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">投稿日</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">初動72h再生</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">初動いいね</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">累計再生</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">累計いいね</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map(post => {
                  const sorted = [...(post.post_metrics ?? [])].sort(
                    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
                  )
                  const deadline = post.posted_at
                    ? new Date(new Date(post.posted_at).getTime() + 72 * 60 * 60 * 1000)
                    : null
                  const initial = deadline
                    ? sorted.filter(m => new Date(m.recorded_at) <= deadline).pop()
                    : null
                  const latest = sorted[sorted.length - 1]

                  return (
                    <tr key={post.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <a
                          href={`https://www.tiktok.com/@_/video/${post.tiktok_video_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline font-mono text-xs"
                        >
                          {post.tiktok_video_id}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {post.posted_at ? new Date(post.posted_at).toLocaleDateString('ja-JP') : '—'}
                      </td>
                      <td className="px-4 py-4 text-right text-slate-700">{initial ? fmt(initial.views) : '—'}</td>
                      <td className="px-4 py-4 text-right text-slate-700">{initial ? fmt(initial.likes) : '—'}</td>
                      <td className="px-4 py-4 text-right font-medium text-slate-900">{latest ? fmt(latest.views) : '—'}</td>
                      <td className="px-4 py-4 text-right text-slate-700">{latest ? fmt(latest.likes) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
