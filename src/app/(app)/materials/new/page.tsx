import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createMaterial(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const title = formData.get('title') as string
  if (!title?.trim()) return

  const castMemberId = formData.get('cast_member_id') as string
  const dealId = formData.get('deal_id') as string

  const { data } = await supabase
    .from('materials')
    .insert({
      title: title.trim(),
      file_url: (formData.get('file_url') as string) || null,
      file_type: (formData.get('file_type') as string) || null,
      cast_member_id: castMemberId || null,
      deal_id: dealId || null,
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (data) redirect('/materials')
}

export default async function NewMaterialPage() {
  const supabase = await createClient()

  const [{ data: casts }, { data: deals }] = await Promise.all([
    supabase.from('cast_profiles').select('member_id,members!cast_profiles_member_id_members_id_fk(name)').order('created_at', { ascending: false }),
    supabase.from('deals').select('id,name').order('created_at', { ascending: false }),
  ])

  type CastOption = { member_id: string; members: { name: string } | null }
  const castOptions = (casts ?? []) as unknown as CastOption[]

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/materials" className="text-slate-400 hover:text-slate-600 text-sm">
          ← 素材一覧
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">素材を追加</h1>
      </div>

      <form action={createMaterial} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            素材名 <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ファイルURL</label>
          <input
            name="file_url"
            placeholder="https://drive.google.com/..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">種別</label>
            <input
              name="file_type"
              placeholder="例: video, image"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">キャスト</label>
            <select
              name="cast_member_id"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              defaultValue=""
            >
              <option value="">未指定</option>
              {castOptions.map(c => (
                <option key={c.member_id} value={c.member_id}>{c.members?.name ?? c.member_id}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">商材</label>
          <select
            name="deal_id"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            defaultValue=""
          >
            <option value="">未指定</option>
            {(deals ?? []).map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">メモ</label>
          <textarea
            name="notes"
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
            href="/materials"
            className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
