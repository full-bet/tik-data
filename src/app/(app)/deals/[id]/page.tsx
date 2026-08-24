import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

async function addDealContact(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const dealId = formData.get('deal_id') as string
  const memberId = formData.get('member_id') as string
  if (!memberId) return

  await supabase.from('deal_contacts').insert({
    deal_id: dealId,
    member_id: memberId,
    role_note: (formData.get('role_note') as string) || null,
  })

  redirect(`/deals/${dealId}?saved=1`)
}

async function deleteDealContact(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const dealId = formData.get('deal_id') as string
  const contactId = formData.get('contact_id') as string

  await supabase.from('deal_contacts').delete().eq('id', contactId)

  redirect(`/deals/${dealId}?saved=1`)
}

async function setMonthlyTarget(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const dealId = formData.get('deal_id') as string
  const month = formData.get('target_month') as string // "YYYY-MM"
  const budget = formData.get('budget_cv_count') as string
  if (!month) return

  await supabase.from('deal_monthly_targets').upsert(
    {
      deal_id: dealId,
      target_month: `${month}-01`,
      budget_cv_count: budget ? Number(budget) : 0,
    },
    { onConflict: 'deal_id,target_month' }
  )

  redirect(`/deals/${dealId}?saved=1`)
}

async function deleteMonthlyTarget(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const dealId = formData.get('deal_id') as string
  const targetId = formData.get('target_id') as string

  await supabase.from('deal_monthly_targets').delete().eq('id', targetId)

  redirect(`/deals/${dealId}?saved=1`)
}

async function addCvEvent(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const dealId = formData.get('deal_id') as string
  const cvCount = formData.get('cv_count') as string

  await supabase.from('deal_cv_events').insert({
    deal_id: dealId,
    cv_count: cvCount ? Number(cvCount) : 1,
    source: (formData.get('source') as string) || null,
    note: (formData.get('note') as string) || null,
  })

  redirect(`/deals/${dealId}?saved=1`)
}

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: deal },
    { data: contacts },
    { data: allMembers },
    { data: targets },
    { data: cvEvents },
  ] = await Promise.all([
    supabase.from('deals').select('*,clients(name)').eq('id', id).single(),
    supabase.from('deal_contacts').select('id,role_note,members(id,name)').eq('deal_id', id),
    supabase.from('members').select('id,name').order('name'),
    supabase.from('deal_monthly_targets').select('*').eq('deal_id', id).order('target_month', { ascending: false }),
    supabase.from('deal_cv_events').select('*').eq('deal_id', id).order('occurred_at', { ascending: false }).limit(50),
  ])

  if (!deal) notFound()

  type ContactRow = { id: string; role_note: string | null; members: { id: string; name: string } | null }
  const contactRows = (contacts ?? []) as unknown as ContactRow[]

  const achievedByMonth = new Map<string, number>()
  for (const ev of cvEvents ?? []) {
    if (!ev.occurred_at) continue
    const key = String(ev.occurred_at).slice(0, 7) // "YYYY-MM"
    achievedByMonth.set(key, (achievedByMonth.get(key) ?? 0) + (ev.cv_count ?? 0))
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl space-y-6">
      <div>
        <Link href="/deals" className="text-neutral-500 hover:text-white text-sm">
          ← 商材一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">{deal.name}</h1>
        <p className="text-neutral-500 text-sm mt-1">{deal.clients?.name ?? '提供元法人未設定'}</p>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <h2 className="font-semibold text-neutral-200 mb-4">仲介者・コミュニケーション担当</h2>

        {contactRows.length > 0 ? (
          <div className="space-y-2 mb-5">
            {contactRows.map(c => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2 border border-neutral-800 rounded-lg">
                <div>
                  <span className="text-sm text-white">{c.members?.name ?? '(不明)'}</span>
                  {c.role_note && <span className="text-neutral-500 text-xs ml-2">{c.role_note}</span>}
                </div>
                <form action={deleteDealContact}>
                  <input type="hidden" name="deal_id" value={id} />
                  <input type="hidden" name="contact_id" value={c.id} />
                  <button type="submit" className="text-xs text-red-400 hover:text-red-300">削除</button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm mb-5">まだ登録されていません</p>
        )}

        <form action={addDealContact} className="flex flex-col sm:flex-row gap-3">
          <input type="hidden" name="deal_id" value={id} />
          <select
            name="member_id"
            required
            defaultValue=""
            className="flex-1 px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <option value="" disabled>メンバーを選択</option>
            {(allMembers ?? []).map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <input
            name="role_note"
            placeholder="例: 仲介者"
            className="flex-1 px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors whitespace-nowrap"
          >
            追加
          </button>
        </form>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <h2 className="font-semibold text-neutral-200 mb-4">月次CV目標</h2>

        {targets && targets.length > 0 ? (
          <div className="space-y-2 mb-5">
            {targets.map(t => {
              const monthKey = String(t.target_month).slice(0, 7)
              const achieved = achievedByMonth.get(monthKey) ?? 0
              return (
                <div key={t.id} className="flex items-center justify-between px-3 py-2 border border-neutral-800 rounded-lg">
                  <div>
                    <span className="text-sm text-white">{monthKey}</span>
                    <span className="text-neutral-500 text-xs ml-2">
                      実績 {achieved} / 目標 {t.budget_cv_count ?? 0}
                    </span>
                  </div>
                  <form action={deleteMonthlyTarget}>
                    <input type="hidden" name="deal_id" value={id} />
                    <input type="hidden" name="target_id" value={t.id} />
                    <button type="submit" className="text-xs text-red-400 hover:text-red-300">削除</button>
                  </form>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm mb-5">まだ設定されていません</p>
        )}

        <form action={setMonthlyTarget} className="flex flex-col sm:flex-row gap-3">
          <input type="hidden" name="deal_id" value={id} />
          <input
            type="month"
            name="target_month"
            required
            className="px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
          <input
            type="number"
            name="budget_cv_count"
            placeholder="目標CV数"
            className="flex-1 px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors whitespace-nowrap"
          >
            設定
          </button>
        </form>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <h2 className="font-semibold text-neutral-200 mb-4">CV発生ログ</h2>

        {cvEvents && cvEvents.length > 0 ? (
          <div className="space-y-2 mb-5 max-h-80 overflow-y-auto">
            {cvEvents.map(ev => (
              <div key={ev.id} className="px-3 py-2 border border-neutral-800 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white">CV +{ev.cv_count}</span>
                  <span className="text-neutral-500 text-xs">
                    {ev.occurred_at ? new Date(ev.occurred_at).toLocaleString('ja-JP') : ''}
                  </span>
                </div>
                {(ev.source || ev.note) && (
                  <p className="text-neutral-500 text-xs mt-1">
                    {[ev.source, ev.note].filter(Boolean).join(' / ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm mb-5">CVはまだ記録されていません</p>
        )}

        <form action={addCvEvent} className="flex flex-col sm:flex-row gap-3">
          <input type="hidden" name="deal_id" value={id} />
          <input
            type="number"
            name="cv_count"
            defaultValue={1}
            min={1}
            className="w-24 px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
          <input
            name="source"
            placeholder="発生元（例: 投稿URL）"
            className="flex-1 px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
          <input
            name="note"
            placeholder="メモ"
            className="flex-1 px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors whitespace-nowrap"
          >
            記録
          </button>
        </form>
      </div>
    </div>
  )
}
