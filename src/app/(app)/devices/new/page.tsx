import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createDevice(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name?.trim()) return

  const assignedMemberId = formData.get('assigned_member_id') as string

  const { data } = await supabase
    .from('devices')
    .insert({
      name: name.trim(),
      owner_type: (formData.get('owner_type') as string) || null,
      usage_note: (formData.get('usage_note') as string) || null,
      assigned_member_id: assignedMemberId || null,
    })
    .select('id')
    .single()

  if (data) redirect('/devices')
}

export default async function NewDevicePage() {
  const supabase = await createClient()
  const { data: members } = await supabase.from('members').select('id,name').order('name')

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/devices" className="text-neutral-500 hover:text-white text-sm">
          ← 端末一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">端末を追加</h1>
      </div>

      <form action={createDevice} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            端末名 <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="例: そらi15, そらiXR"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">所有区分</label>
            <select
              name="owner_type"
              defaultValue=""
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">未指定</option>
              <option value="personal">個人端末</option>
              <option value="company">会社支給端末</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">担当者</label>
            <select
              name="assigned_member_id"
              defaultValue=""
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">未指定</option>
              {(members ?? []).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">利用メモ</label>
          <textarea
            name="usage_note"
            rows={2}
            placeholder="ログイン用途、少しでも使う端末、等"
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
            href="/devices"
            className="px-6 py-2 border border-neutral-700 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
