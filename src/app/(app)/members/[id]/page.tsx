import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ROLE_OPTIONS } from '@/lib/members'

async function updateMember(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string

  const name = formData.get('name') as string
  if (!name?.trim()) return

  await supabase.from('members').update({
    name: name.trim(),
    memo: (formData.get('memo') as string) || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  const newRoles = new Set(formData.getAll('roles') as string[])

  const { data: existingRoles } = await supabase.from('member_roles').select('id,role').eq('member_id', id)
  const currentRoles = new Set((existingRoles ?? []).map(r => r.role))

  const toRemove = (existingRoles ?? []).filter(r => !newRoles.has(r.role)).map(r => r.id)
  if (toRemove.length > 0) {
    await supabase.from('member_roles').delete().in('id', toRemove)
  }

  const toAdd = [...newRoles].filter(role => !currentRoles.has(role))
  if (toAdd.length > 0) {
    await supabase.from('member_roles').insert(toAdd.map(role => ({ member_id: id, role })))
  }

  if (newRoles.has('cast')) {
    const { data: profile } = await supabase.from('cast_profiles').select('member_id').eq('member_id', id).maybeSingle()
    if (!profile) {
      await supabase.from('cast_profiles').insert({ member_id: id })
    }
  }

  redirect(`/members/${id}?saved=1`)
}

async function updateCastProfile(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  const age = formData.get('age') as string

  await supabase.from('cast_profiles').update({
    age: age ? Number(age) : null,
    gender: (formData.get('gender') as string) || null,
    contact_method: (formData.get('contact_method') as string) || null,
    exposure_range: (formData.get('exposure_range') as string) || null,
    ng_notes: (formData.get('ng_notes') as string) || null,
    updated_at: new Date().toISOString(),
  }).eq('member_id', id)

  redirect(`/members/${id}?saved=1`)
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: member }, { data: roles }, { data: castProfile }] = await Promise.all([
    supabase.from('members').select('*').eq('id', id).single(),
    supabase.from('member_roles').select('role').eq('member_id', id),
    supabase.from('cast_profiles').select('*').eq('member_id', id).maybeSingle(),
  ])

  if (!member) notFound()

  const currentRoles = new Set((roles ?? []).map(r => r.role))

  return (
    <div className="p-4 sm:p-8 max-w-2xl space-y-6">
      <div>
        <Link href="/members" className="text-neutral-500 hover:text-white text-sm">
          ← メンバー一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">{member.name}</h1>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <h2 className="font-semibold text-neutral-200 mb-5">基本情報</h2>
        <form action={updateMember} className="space-y-5">
          <input type="hidden" name="id" value={id} />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              名前 <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              required
              defaultValue={member.name}
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
                  <input
                    type="checkbox"
                    name="roles"
                    value={r.value}
                    defaultChecked={currentRoles.has(r.value)}
                    className="accent-indigo-600"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">メモ</label>
            <textarea
              name="memo"
              rows={3}
              defaultValue={member.memo ?? ''}
              className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            保存する
          </button>
        </form>
      </div>

      {castProfile && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h2 className="font-semibold text-neutral-200 mb-5">キャスト詳細</h2>
          <form action={updateCastProfile} className="space-y-5">
            <input type="hidden" name="id" value={id} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">年齢</label>
                <input
                  type="number"
                  name="age"
                  defaultValue={castProfile.age ?? ''}
                  className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">性別</label>
                <input
                  name="gender"
                  defaultValue={castProfile.gender ?? ''}
                  className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">連絡方法</label>
              <input
                name="contact_method"
                defaultValue={castProfile.contact_method ?? ''}
                placeholder="例: LINE、Xのdmなど"
                className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">露出可能範囲</label>
              <textarea
                name="exposure_range"
                rows={2}
                defaultValue={castProfile.exposure_range ?? ''}
                className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">NG事項・項目</label>
              <textarea
                name="ng_notes"
                rows={2}
                defaultValue={castProfile.ng_notes ?? ''}
                className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              保存する
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
