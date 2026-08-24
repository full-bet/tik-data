import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DeleteArticleButton } from './DeleteArticleButton'

async function deleteArticle(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('taggables').delete().eq('entity_type', 'knowledge_article').eq('entity_id', id)
  await supabase.from('knowledge_articles').delete().eq('id', id)
  redirect('/knowledge')
}

export default async function KnowledgeArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: article }, { data: tagLinks }] = await Promise.all([
    supabase.from('knowledge_articles').select('*,members(name)').eq('id', id).single(),
    supabase.from('taggables').select('tags(id,name)').eq('entity_type', 'knowledge_article').eq('entity_id', id),
  ])

  if (!article) notFound()

  type TagLink = { tags: { id: string; name: string } | null }
  const tags = ((tagLinks ?? []) as unknown as TagLink[]).map(l => l.tags).filter(Boolean) as { id: string; name: string }[]

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/knowledge" className="text-neutral-500 hover:text-white text-sm">
          ← ナレッジ一覧
        </Link>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-white">{article.title}</h1>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/knowledge/${id}/edit`}
              className="px-3 py-1.5 border border-neutral-700 text-neutral-300 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors"
            >
              編集
            </Link>
          </div>
        </div>
        <p className="text-neutral-500 text-xs mb-4">
          {article.members?.name ?? '作成者未設定'} · 作成: {new Date(article.created_at).toLocaleDateString('ja-JP')}
          {article.updated_at && article.updated_at !== article.created_at && (
            <> · 更新: {new Date(article.updated_at).toLocaleDateString('ja-JP')}</>
          )}
        </p>

        {tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-6">
            {tags.map(t => (
              <Link
                key={t.id}
                href={`/knowledge?tag=${t.id}`}
                className="inline-block px-2 py-0.5 bg-neutral-500/10 text-neutral-300 rounded text-xs font-medium hover:bg-neutral-500/20"
              >
                {t.name}
              </Link>
            ))}
          </div>
        )}

        {article.content ? (
          <div className="prose prose-invert prose-neutral max-w-none prose-headings:font-semibold prose-a:text-neutral-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">本文はまだありません</p>
        )}

        <div className="mt-8 pt-4 border-t border-neutral-800 text-right">
          <form action={deleteArticle} className="inline">
            <input type="hidden" name="id" value={id} />
            <DeleteArticleButton />
          </form>
        </div>
      </div>
    </div>
  )
}
