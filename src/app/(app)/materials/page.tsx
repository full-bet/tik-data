import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MaterialsPage() {
  const supabase = await createClient()

  const { data: materials } = await supabase
    .from('materials')
    .select('id,title,file_url,notes,created_at')
    .order('created_at', { ascending: false })

  const materialIds = (materials ?? []).map(m => m.id)

  type CastLink = { material_id: string; members: { name: string } | null }
  type DealLink = { material_id: string; deals: { name: string } | null }
  type TagLink = { entity_id: string; tags: { name: string } | null }

  const [{ data: castLinksRaw }, { data: dealLinksRaw }, { data: tagLinksRaw }] = await Promise.all([
    materialIds.length
      ? supabase.from('material_casts').select('material_id,members(name)').in('material_id', materialIds)
      : Promise.resolve({ data: [] }),
    materialIds.length
      ? supabase.from('material_deals').select('material_id,deals(name)').in('material_id', materialIds)
      : Promise.resolve({ data: [] }),
    materialIds.length
      ? supabase.from('taggables').select('entity_id,tags(name)').eq('entity_type', 'material').in('entity_id', materialIds)
      : Promise.resolve({ data: [] }),
  ])
  const castLinks = (castLinksRaw ?? []) as unknown as CastLink[]
  const dealLinks = (dealLinksRaw ?? []) as unknown as DealLink[]
  const tagLinks = (tagLinksRaw ?? []) as unknown as TagLink[]

  const castsByMaterial = new Map<string, string[]>()
  for (const link of castLinks) {
    const name = link.members?.name
    if (!name) continue
    castsByMaterial.set(link.material_id, [...(castsByMaterial.get(link.material_id) ?? []), name])
  }

  const dealsByMaterial = new Map<string, string[]>()
  for (const link of dealLinks) {
    const name = link.deals?.name
    if (!name) continue
    dealsByMaterial.set(link.material_id, [...(dealsByMaterial.get(link.material_id) ?? []), name])
  }

  const tagsByMaterial = new Map<string, string[]>()
  for (const link of tagLinks) {
    const name = link.tags?.name
    if (!name) continue
    tagsByMaterial.set(link.entity_id, [...(tagsByMaterial.get(link.entity_id) ?? []), name])
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">素材</h1>
          <p className="text-neutral-500 text-sm mt-1">{materials?.length ?? 0}件</p>
        </div>
        <Link
          href="/materials/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {!materials || materials.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-16 text-center">
          <p className="text-4xl mb-4">🎞️</p>
          <p className="text-neutral-400 font-medium">素材がまだ登録されていません</p>
          <Link
            href="/materials/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初の素材を追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {materials.map(m => (
            <div key={m.id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{m.title}</p>
                  <p className="text-neutral-500 text-sm mt-1">
                    {[...(castsByMaterial.get(m.id) ?? []), ...(dealsByMaterial.get(m.id) ?? [])].join(' / ') || '—'}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end shrink-0">
                  {(tagsByMaterial.get(m.id) ?? []).map((name, i) => (
                    <span key={i} className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              {m.file_url && (
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-indigo-400 text-xs mt-2 hover:underline truncate max-w-full"
                >
                  {m.file_url}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
