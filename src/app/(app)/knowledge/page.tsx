import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>
}) {
  const { q, tag: tagFilter } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('knowledge_articles')
    .select('id,title,content,updated_at,members(name)')
    .order('updated_at', { ascending: false })

  if (q?.trim()) {
    const term = q.trim().replace(/[%_]/g, '')
    query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`)
  }

  const { data: articles } = await query

  const articleIds = (articles ?? []).map(a => a.id)

  type TagLink = { entity_id: string; tags: { id: string; name: string } | null }
  const { data: tagLinksRaw } = articleIds.length
    ? await supabase.from('taggables').select('entity_id,tags(id,name)').eq('entity_type', 'knowledge_article').in('entity_id', articleIds)
    : { data: [] }
  const tagLinks = (tagLinksRaw ?? []) as unknown as TagLink[]

  const tagsByArticle = new Map<string, { id: string; name: string }[]>()
  for (const link of tagLinks) {
    if (!link.tags) continue
    tagsByArticle.set(link.entity_id, [...(tagsByArticle.get(link.entity_id) ?? []), link.tags])
  }

  type ArticleRow = { id: string; title: string; content: string | null; updated_at: string; members: { name: string } | null }
  let rows = (articles ?? []) as unknown as ArticleRow[]

  if (tagFilter) {
    rows = rows.filter(a => (tagsByArticle.get(a.id) ?? []).some(t => t.id === tagFilter))
  }

  const { data: tagOptions } = await supabase.from('tags').select('id,name').is('category', null).order('name')

  function excerpt(content: string | null) {
    if (!content) return null
    const plain = content.replace(/[#*`>_\-\[\]!]/g, '').replace(/\s+/g, ' ').trim()
    return plain.length > 120 ? `${plain.slice(0, 120)}…` : plain
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">ナレッジ</h1>
          <p className="text-neutral-500 text-sm mt-1">{rows.length}件</p>
        </div>
        <Link
          href="/knowledge/new"
          className="px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors"
        >
          + 作成
        </Link>
      </div>

      <form method="get" className="flex flex-wrap gap-3 mb-6">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="タイトル・本文を検索"
          className="flex-1 min-w-[200px] px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
        />
        <select
          name="tag"
          defaultValue={tagFilter ?? ''}
          className="px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
        >
          <option value="">タグで絞り込み（すべて）</option>
          {(tagOptions ?? []).map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
        >
          検索
        </button>
        {(q || tagFilter) && (
          <Link href="/knowledge" className="px-4 py-2 text-neutral-500 text-sm hover:text-white transition-colors">
            リセット
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-16 text-center">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-neutral-400 font-medium">
            {articles && articles.length > 0 ? '条件に一致するナレッジがありません' : 'ナレッジがまだありません'}
          </p>
          <Link
            href="/knowledge/new"
            className="inline-block mt-4 px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600"
          >
            最初のナレッジを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map(a => (
            <Link
              key={a.id}
              href={`/knowledge/${a.id}`}
              className="block bg-neutral-900 rounded-xl border border-neutral-800 p-5 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{a.title}</p>
                  <p className="text-neutral-500 text-xs mt-1">
                    {a.members?.name ?? '作成者未設定'} · 更新: {new Date(a.updated_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end shrink-0">
                  {(tagsByArticle.get(a.id) ?? []).map(t => (
                    <span key={t.id} className="inline-block px-2 py-0.5 bg-neutral-500/10 text-neutral-300 rounded text-xs font-medium">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
              {excerpt(a.content) && (
                <p className="text-neutral-400 text-sm mt-3 line-clamp-2">{excerpt(a.content)}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
