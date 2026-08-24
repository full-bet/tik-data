import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createTest(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const name = formData.get('name') as string
  const dealId = formData.get('deal_id') as string
  if (!name?.trim() || !dealId) return

  const optional = (key: string) => (formData.get(key) as string) || null

  const { data } = await supabase
    .from('tests')
    .insert({
      name: name.trim(),
      deal_id: dealId,
      what_how: optional('what_how'),
      account_persona: optional('account_persona'),
      account_id: optional('account_id'),
      win_condition: optional('win_condition'),
      premise: optional('premise'),
      rationale: optional('rationale'),
      completion_condition: optional('completion_condition'),
      competitor_id: optional('competitor_id'),
      editor_member_id: optional('editor_member_id'),
      shooter_member_id: optional('shooter_member_id'),
      reviewer_member_id: optional('reviewer_member_id'),
      caption: optional('caption'),
      notes: optional('notes'),
    })
    .select('id')
    .single()

  if (data) redirect(`/tests/${data.id}`)
}

export default async function NewTestPage() {
  const supabase = await createClient()

  const [{ data: deals }, { data: competitors }, { data: members }, { data: accounts }] = await Promise.all([
    supabase.from('deals').select('id,name').order('name'),
    supabase.from('competitors').select('id,url,video_title,appeal_angle').order('created_at', { ascending: false }),
    supabase.from('members').select('id,name').order('name'),
    supabase.from('accounts').select('id,tiktok_username,tiktok_display_name').order('created_at', { ascending: false }),
  ])

  const memberOptions = members ?? []

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/tests" className="text-neutral-500 hover:text-white text-sm">
          ← テスト一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">テストを追加</h1>
      </div>

      <form action={createTest} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              テスト名 <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="例: test-1"
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              商材 <span className="text-red-400">*</span>
            </label>
            <select
              name="deal_id"
              required
              defaultValue=""
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              <option value="" disabled>選択してください</option>
              {(deals ?? []).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">このtestでやること - What &amp; How</label>
          <textarea
            name="what_how"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">対象アカウント種別</label>
            <input
              name="account_persona"
              placeholder="例: エリートチー牛アカウント"
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">投稿先アカウント</label>
            <select
              name="account_id"
              defaultValue=""
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              <option value="">未定</option>
              {(accounts ?? []).map(a => (
                <option key={a.id} value={a.id}>@{a.tiktok_username ?? a.tiktok_display_name ?? a.id}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">参考にするベンチマーク動画</label>
          <select
            name="competitor_id"
            defaultValue=""
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <option value="">未定</option>
            {(competitors ?? []).map(c => (
              <option key={c.id} value={c.id}>
                {c.appeal_angle ?? c.video_title ?? c.url}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">勝利条件</label>
          <input
            name="win_condition"
            placeholder="例: 1CV"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">前提</label>
          <textarea
            name="premise"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">背景 - Why</label>
          <textarea
            name="rationale"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">完了条件</label>
          <textarea
            name="completion_condition"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">編集者</label>
            <select
              name="editor_member_id"
              defaultValue=""
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              <option value="">未定</option>
              {memberOptions.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">撮影者</label>
            <select
              name="shooter_member_id"
              defaultValue=""
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              <option value="">未定</option>
              {memberOptions.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">レビュアー</label>
            <select
              name="reviewer_member_id"
              defaultValue=""
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              <option value="">未定</option>
              {memberOptions.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">キャプションなど</label>
          <textarea
            name="caption"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">メモ</label>
          <textarea
            name="notes"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors"
          >
            追加する
          </button>
          <Link
            href="/tests"
            className="px-6 py-2 border border-neutral-700 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
