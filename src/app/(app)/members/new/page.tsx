import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ROLE_OPTIONS = [
  { value: 'cast', label: 'キャスト' },
  { value: 'editor', label: '編集者' },
  { value: 'operator', label: '運用者' },
  { value: 'broker', label: '仲介者' },
  { value: 'shooter', label: '撮影者' },
  { value: 'reviewer', label: 'レビュアー' },
  { value: 'other', label: 'その他' },
]

async function createMember(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name?.trim()) return

  const roles = formData.getAll('roles') as string[]

  const { data: member } = await supabase
    .from('members')
    .insert({ name: name.trim(), memo: (formData.get('memo') as string) || null })
    .select('id')
    .single()

  if (!member) return

  if (roles.length > 0) {
    await supabase.from('member_roles').insert(roles.map(role => ({ member_id: member.id, role })))
  }

  if (roles.includes('cast')) {
    await supabase.from('cast_profiles').insert({ member_id: member.id })
  }

  redirect('/members')
}

export default function NewMemberPage() {
  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/members" className="text-neutral-500 hover:text-white text-sm">
          ← メンバー一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">メンバーを追加</h1>
      </div>

      <form action={createMember} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            名前 <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            required
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">役割（複数選択可）</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROLE_OPTIONS.map(r => (
              <label
                key={r.value}
                className="flex items-center gap-2 px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300 cursor-pointer hover:bg-white/5"
              >
                <input type="checkbox" name="roles" value={r.value} className="accent-indigo-600" />
                {r.label}
              </label>
            ))}
          </div>
          <p className="text-neutral-500 text-xs mt-2">
            「キャスト」を選ぶと、キャスト一覧にもプロフィール未入力の状態で表示されます（年齢・NG事項などの詳細項目は別途キャストとして登録してください）
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">メモ</label>
          <textarea
            name="memo"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            追加する
          </button>
          <Link
            href="/members"
            className="px-6 py-2 border border-neutral-700 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
