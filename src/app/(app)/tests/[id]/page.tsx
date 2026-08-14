import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500 mb-1">{label}</p>
      <p className="text-sm text-neutral-200 whitespace-pre-wrap">{value}</p>
    </div>
  )
}

export default async function TestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: test } = await supabase.from('tests').select('*').eq('id', id).single()
  if (!test) notFound()

  const memberIds = [test.editor_member_id, test.shooter_member_id, test.reviewer_member_id].filter(Boolean)

  const [{ data: deal }, { data: competitor }, { data: members }, { data: comments }, { data: cuts }] = await Promise.all([
    test.deal_id ? supabase.from('deals').select('name').eq('id', test.deal_id).single() : Promise.resolve({ data: null }),
    test.competitor_id
      ? supabase.from('competitors').select('url,video_title,appeal_angle').eq('id', test.competitor_id).single()
      : Promise.resolve({ data: null }),
    memberIds.length
      ? supabase.from('members').select('id,name').in('id', memberIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    supabase.from('test_seed_comments').select('comment_text,is_candidate,members(name)').eq('test_id', id),
    supabase.from('storyboard_cuts').select('cut_order,description,source_type').eq('test_id', id).order('cut_order'),
  ])

  const memberName = (memberId: string | null) =>
    (members ?? []).find(m => m.id === memberId)?.name ?? null

  type CommentRow = { comment_text: string; is_candidate: boolean; members: { name: string } | null }
  const seedComments = (comments ?? []) as unknown as CommentRow[]

  return (
    <div className="p-4 sm:p-8 max-w-4xl space-y-6">
      <div>
        <Link href="/tests" className="text-neutral-500 hover:text-white text-sm">
          ← テスト一覧
        </Link>
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-bold text-white">{test.name}</h1>
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              test.posted_at ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-500'
            }`}
          >
            {test.posted_at ? '投稿済み' : '進行中'}
          </span>
        </div>
        {deal && <p className="text-neutral-500 text-sm mt-1">商材: {deal.name}</p>}
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-4">
        <h2 className="font-semibold text-neutral-200">概要</h2>
        <Field label="このtestでやること - What & How" value={test.what_how} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="対象アカウント種別" value={test.account_persona} />
          <Field label="勝利条件" value={test.win_condition} />
        </div>
        <Field label="前提" value={test.premise} />
        <Field label="背景 - Why" value={test.rationale} />
        <Field label="完了条件" value={test.completion_condition} />
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <h2 className="font-semibold text-neutral-200 mb-4">スケジュール</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
          {[
            ['素材準備完了', test.material_ready_at],
            ['台本レビュー依頼完了', test.script_review_requested_at],
            ['編集完了', test.edit_completed_at],
            ['動画レビュー依頼完了', test.video_review_requested_at],
            ['投稿完了', test.posted_at],
          ].map(([label, date]) => (
            <div key={label as string}>
              <p className="text-xs text-neutral-500">{label}</p>
              <p className="text-neutral-300 mt-1">{date ? String(date) : '未定'}</p>
            </div>
          ))}
        </div>
      </div>

      {competitor && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-2">
          <h2 className="font-semibold text-neutral-200">参考にしたベンチマーク動画</h2>
          {competitor.appeal_angle && <p className="text-sm text-neutral-300">訴求: {competitor.appeal_angle}</p>}
          <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-sm hover:underline break-all">
            {competitor.video_title ?? competitor.url}
          </a>
        </div>
      )}

      {(cuts ?? []).length > 0 && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h2 className="font-semibold text-neutral-200 mb-4">作成する動画のコマ割り</h2>
          <ol className="space-y-2 text-sm">
            {(cuts ?? []).map((c, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-neutral-500 shrink-0">{c.cut_order}.</span>
                <span className="text-neutral-300">{c.description}</span>
                {c.source_type && (
                  <span className="ml-auto shrink-0 px-2 py-0.5 bg-neutral-800 text-neutral-500 rounded text-xs">
                    {c.source_type}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-4">
        <h2 className="font-semibold text-neutral-200">編集・撮影・レビュー方針</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="編集者" value={memberName(test.editor_member_id)} />
          <Field label="撮影者" value={memberName(test.shooter_member_id)} />
          <Field label="レビュアー" value={memberName(test.reviewer_member_id)} />
        </div>
        <Field label="編集依頼書" value={test.edit_request_doc_url} />
        <Field label="撮影依頼書" value={test.shooting_request_doc_url} />
        <Field label="既にある素材のdrive" value={test.existing_material_drive_url} />
        <Field label="質問・不安なところ" value={test.review_questions} />
        <Field label="レビューしてほしい部分・注意点" value={test.review_focus_points} />
        <Field label="レビュアーからの総評" value={test.reviewer_feedback} />
      </div>

      {seedComments.length > 0 && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h2 className="font-semibold text-neutral-200 mb-4">コメント方針</h2>
          <ul className="space-y-2 text-sm">
            {seedComments.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-medium text-neutral-400 shrink-0">
                  {c.members?.name ?? (c.is_candidate ? '候補' : '未定')}:
                </span>
                <span className="text-neutral-300">「{c.comment_text}」</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(test.caption || test.notes) && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-4">
          <Field label="キャプションなど" value={test.caption} />
          <Field label="メモ" value={test.notes} />
        </div>
      )}
    </div>
  )
}
