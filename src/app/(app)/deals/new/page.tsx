import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createDeal(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name?.trim()) return

  let clientId: string | null = null
  const clientName = (formData.get('client_name') as string)?.trim()
  if (clientName) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('name', clientName)
      .maybeSingle()

    if (existing) {
      clientId = existing.id
    } else {
      const { data: created } = await supabase
        .from('clients')
        .insert({ name: clientName })
        .select('id')
        .single()
      clientId = created?.id ?? null
    }
  }

  const unitPrice = formData.get('unit_price') as string

  const { data: deal } = await supabase
    .from('deals')
    .insert({
      name: name.trim(),
      client_id: clientId,
      unit_price: unitPrice || null,
      characteristics: (formData.get('characteristics') as string) || null,
      selection_rationale: (formData.get('selection_rationale') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (deal) redirect('/deals')
}

export default function NewDealPage() {
  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/deals" className="text-neutral-500 hover:text-white text-sm">
          ← 商材一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">商材を追加</h1>
      </div>

      <form action={createDeal} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            商材名 <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            required
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">商材提供元法人</label>
          <input
            name="client_name"
            placeholder="既存の法人名を入力すると自動で紐付きます"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">単価</label>
          <input
            name="unit_price"
            type="number"
            step="any"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">商材の特徴</label>
          <textarea
            name="characteristics"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">選定理由</label>
          <textarea
            name="selection_rationale"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
          />
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
            href="/deals"
            className="px-6 py-2 border border-neutral-700 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
