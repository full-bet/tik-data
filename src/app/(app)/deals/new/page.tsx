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
        <Link href="/deals" className="text-slate-400 hover:text-slate-600 text-sm">
          ← 商材一覧
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">商材を追加</h1>
      </div>

      <form action={createDeal} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            商材名 <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">商材提供元法人</label>
          <input
            name="client_name"
            placeholder="既存の法人名を入力すると自動で紐付きます"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">単価</label>
          <input
            name="unit_price"
            type="number"
            step="any"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">商材の特徴</label>
          <textarea
            name="characteristics"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">選定理由</label>
          <textarea
            name="selection_rationale"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
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
            href="/deals"
            className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
