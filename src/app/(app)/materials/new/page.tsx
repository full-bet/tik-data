import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createMaterial(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const selectedTagIds = formData.getAll('tag_ids') as string[]
  const newTagNames = ((formData.get('new_tags') as string) || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const tagEntries: { id: string; name: string }[] = []

  if (selectedTagIds.length > 0) {
    const { data: existing } = await supabase.from('tags').select('id,name').in('id', selectedTagIds)
    tagEntries.push(...(existing ?? []))
  }

  for (const name of newTagNames) {
    const { data: existingTag } = await supabase.from('tags').select('id,name').eq('name', name).is('category', null).maybeSingle()
    if (existingTag) {
      if (!tagEntries.some(t => t.id === existingTag.id)) tagEntries.push(existingTag)
    } else {
      const { data: created } = await supabase.from('tags').insert({ name }).select('id,name').single()
      if (created) tagEntries.push(created)
    }
  }

  if (tagEntries.length === 0) return

  const title = tagEntries.map(t => t.name).join('_')

  const { data: material } = await supabase
    .from('materials')
    .insert({
      title,
      file_url: (formData.get('file_url') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (!material) return

  await supabase.from('taggables').insert(
    tagEntries.map(t => ({ tag_id: t.id, entity_type: 'material', entity_id: material.id }))
  )

  const castMemberIds = formData.getAll('cast_member_ids') as string[]
  if (castMemberIds.length > 0) {
    await supabase.from('material_casts').insert(
      castMemberIds.map(cast_member_id => ({ material_id: material.id, cast_member_id }))
    )
  }

  const dealIds = formData.getAll('deal_ids') as string[]
  if (dealIds.length > 0) {
    await supabase.from('material_deals').insert(
      dealIds.map(deal_id => ({ material_id: material.id, deal_id }))
    )
  }

  redirect('/materials')
}

export default async function NewMaterialPage() {
  const supabase = await createClient()

  const [{ data: tags }, { data: casts }, { data: deals }] = await Promise.all([
    supabase.from('tags').select('id,name,category').order('name'),
    supabase.from('cast_profiles').select('member_id,members!cast_profiles_member_id_members_id_fk(name)').order('created_at', { ascending: false }),
    supabase.from('deals').select('id,name').order('name'),
  ])

  type CastOption = { member_id: string; members: { name: string } | null }
  const castOptions = (casts ?? []) as unknown as CastOption[]

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/materials" className="text-neutral-500 hover:text-white text-sm">
          ← 素材一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">素材を追加</h1>
      </div>

      <form action={createMaterial} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            タグ（ファイル名になります） <span className="text-red-400">*</span>
          </label>
          {tags && tags.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {tags.map(t => (
                <label
                  key={t.id}
                  className="flex items-center gap-2 px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300 cursor-pointer hover:bg-white/5"
                >
                  <input type="checkbox" name="tag_ids" value={t.id} className="accent-white" />
                  {t.name}
                </label>
              ))}
            </div>
          )}
          <input
            name="new_tags"
            placeholder="新しいタグをカンマ区切りで入力（例: アフリカ人素材, 屋外）"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
          <p className="text-neutral-500 text-xs mt-1">
            選択・入力したタグを「_」で連結してファイル名（素材名）が自動生成されます
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">ファイルURL</label>
          <input
            name="file_url"
            placeholder="https://drive.google.com/..."
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">キャスト（複数選択可）</label>
          {castOptions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {castOptions.map(c => (
                <label
                  key={c.member_id}
                  className="flex items-center gap-2 px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300 cursor-pointer hover:bg-white/5"
                >
                  <input type="checkbox" name="cast_member_ids" value={c.member_id} className="accent-white" />
                  {c.members?.name ?? c.member_id}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">キャストが登録されていません</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">商材（複数選択可）</label>
          {deals && deals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {deals.map(d => (
                <label
                  key={d.id}
                  className="flex items-center gap-2 px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300 cursor-pointer hover:bg-white/5"
                >
                  <input type="checkbox" name="deal_ids" value={d.id} className="accent-white" />
                  {d.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">商材が登録されていません</p>
          )}
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
            href="/materials"
            className="px-6 py-2 border border-neutral-700 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
