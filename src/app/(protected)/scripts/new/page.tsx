import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createScript(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase.from('scripts').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    content: (formData.get('content') as string) || null,
    category: (formData.get('category') as string) || null,
    hook: (formData.get('hook') as string) || null,
  }).select().single()

  if (data) redirect(`/scripts/${data.id}`)
}

export default function NewScriptPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/scripts" className="text-slate-400 hover:text-slate-600 text-sm">
          ← 台本一覧
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">台本を作成</h1>
      </div>

      <form action={createScript} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例: これを知らないと損する〇〇"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            冒頭フック
          </label>
          <input
            name="hook"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例: 〇〇な人は絶対見て"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            カテゴリ
          </label>
          <input
            name="category"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例: 商品紹介, ハウツー, エンタメ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            台本内容
          </label>
          <textarea
            name="content"
            rows={10}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="台本の内容を入力..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            作成する
          </button>
          <Link
            href="/scripts"
            className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
