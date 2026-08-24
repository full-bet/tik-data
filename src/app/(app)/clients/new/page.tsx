import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createClientRecord(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name?.trim()) return

  const { data } = await supabase
    .from('clients')
    .insert({
      name: name.trim(),
      contact_name: (formData.get('contact_name') as string) || null,
      contact_method: (formData.get('contact_method') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (data) redirect('/clients')
}

export default function NewClientPage() {
  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/clients" className="text-neutral-500 hover:text-white text-sm">
          ← 取引先一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">取引先を追加</h1>
      </div>

      <form action={createClientRecord} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            会社名 <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            required
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">担当者名</label>
          <input
            name="contact_name"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">連絡方法・連絡先</label>
          <input
            name="contact_method"
            placeholder="例: メール、Chatwork、担当者携帯番号など"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">メモ</label>
          <textarea
            name="notes"
            rows={3}
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
            href="/clients"
            className="px-6 py-2 border border-neutral-700 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
