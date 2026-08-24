import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createCast(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name?.trim()) return

  const { data: member } = await supabase
    .from('members')
    .insert({ name: name.trim(), memo: (formData.get('memo') as string) || null })
    .select('id')
    .single()

  if (!member) return

  await supabase.from('member_roles').insert({ member_id: member.id, role: 'cast' })

  const age = formData.get('age') as string
  const referrerMemberId = formData.get('referrer_member_id') as string
  await supabase.from('cast_profiles').insert({
    member_id: member.id,
    referrer_member_id: referrerMemberId || null,
    contact_method: (formData.get('contact_method') as string) || null,
    age: age ? Number(age) : null,
    gender: (formData.get('gender') as string) || null,
    exposure_range: (formData.get('exposure_range') as string) || null,
    ng_notes: (formData.get('ng_notes') as string) || null,
  })

  redirect('/casts')
}

export default async function NewCastPage() {
  const supabase = await createClient()
  const { data: members } = await supabase.from('members').select('id,name').order('name')

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/casts" className="text-neutral-500 hover:text-white text-sm">
          ← キャスト一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">キャストを追加</h1>
      </div>

      <form action={createCast} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-5">
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
          <label className="block text-sm font-medium text-neutral-300 mb-1">紹介者</label>
          <select
            name="referrer_member_id"
            defaultValue=""
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">未指定</option>
            {(members ?? []).map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">年齢</label>
            <input
              type="number"
              name="age"
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">性別</label>
            <input
              name="gender"
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">連絡方法</label>
          <input
            name="contact_method"
            placeholder="例: LINE、Xのdmなど"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">露出可能範囲</label>
          <textarea
            name="exposure_range"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">NG事項・項目</label>
          <textarea
            name="ng_notes"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">メモ</label>
          <textarea
            name="memo"
            rows={2}
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
            href="/casts"
            className="px-6 py-2 border border-neutral-700 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
