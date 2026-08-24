import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createArticle(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const title = formData.get('title') as string
  if (!title?.trim()) return

  const selectedTagIds = formData.getAll('tag_ids') as string[]
  const newTagNames = ((formData.get('new_tags') as string) || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const tagIds: string[] = [...selectedTagIds]

  for (const name of newTagNames) {
    const { data: existingTag } = await supabase.from('tags').select('id').eq('name', name).is('category', null).maybeSingle()
    if (existingTag) {
      if (!tagIds.includes(existingTag.id)) tagIds.push(existingTag.id)
    } else {
      const { data: created } = await supabase.from('tags').insert({ name }).select('id').single()
      if (created) tagIds.push(created.id)
    }
  }

  const authorMemberId = formData.get('author_member_id') as string

  const { data: article } = await supabase
    .from('knowledge_articles')
    .insert({
      title: title.trim(),
      content: (formData.get('content') as string) || null,
      author_member_id: authorMemberId || null,
    })
    .select('id')
    .single()

  if (!article) return

  if (tagIds.length > 0) {
    await supabase.from('taggables').insert(
      tagIds.map(tag_id => ({ tag_id, entity_type: 'knowledge_article', entity_id: article.id }))
    )
  }

  redirect(`/knowledge/${article.id}`)
}

export default async function NewKnowledgeArticlePage() {
  const supabase = await createClient()

  const [{ data: members }, { data: tags }] = await Promise.all([
    supabase.from('members').select('id,name').order('name'),
    supabase.from('tags').select('id,name,category').is('category', null).order('name'),
  ])

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/knowledge" className="text-neutral-500 hover:text-white text-sm">
          ← ナレッジ一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">ナレッジを作成</h1>
      </div>

      <form action={createArticle} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            タイトル <span className="text-red-400">*</span>
          </label>
          <input
            name="title"
            required
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">作成者</label>
          <select
            name="author_member_id"
            defaultValue=""
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <option value="">未設定</option>
            {(members ?? []).map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">タグ</label>
          {tags && tags.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {tags.map(t => (
                <label
                  key={t.id}
                  className="flex items-center gap-2 px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300 cursor-pointer hover:bg-white/5"
                >
                  <input type="checkbox" name="tag_ids" value={t.id} className="accent-neutral-300" />
                  {t.name}
                </label>
              ))}
            </div>
          )}
          <input
            name="new_tags"
            placeholder="新しいタグをカンマ区切りで入力（例: 運用マニュアル, 議事録）"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">本文（Markdown）</label>
          <textarea
            name="content"
            rows={16}
            placeholder={'# 見出し\n\n本文をMarkdownで入力できます。'}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors"
          >
            作成する
          </button>
          <Link
            href="/knowledge"
            className="px-6 py-2 border border-neutral-700 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
