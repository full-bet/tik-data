import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createClientRecord(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name?.trim()) return

  const { data: client } = await supabase
    .from('clients')
    .insert({
      name: name.trim(),
      contact_name: (formData.get('contact_name') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (!client) return

  const selectedIds = formData.getAll('contact_method_ids') as string[]
  const newNames = ((formData.get('new_contact_methods') as string) || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const methodIds = [...selectedIds]

  for (const name of newNames) {
    const { data: existing } = await supabase.from('contact_methods').select('id').eq('name', name).maybeSingle()
    if (existing) {
      if (!methodIds.includes(existing.id)) methodIds.push(existing.id)
    } else {
      const { data: created } = await supabase.from('contact_methods').insert({ name }).select('id').single()
      if (created) methodIds.push(created.id)
    }
  }

  if (methodIds.length > 0) {
    await supabase.from('client_contact_methods').insert(
      methodIds.map(contact_method_id => ({ client_id: client.id, contact_method_id }))
    )
  }

  redirect('/clients')
}

export default async function NewClientPage() {
  const supabase = await createClient()
  const { data: contactMethods } = await supabase.from('contact_methods').select('id,name').order('name')

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
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">担当者名</label>
          <input
            name="contact_name"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">連絡方法（複数選択可）</label>
          {contactMethods && contactMethods.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {contactMethods.map(m => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300 cursor-pointer hover:bg-white/5"
                >
                  <input type="checkbox" name="contact_method_ids" value={m.id} className="accent-indigo-600" />
                  {m.name}
                </label>
              ))}
            </div>
          )}
          <input
            name="new_contact_methods"
            placeholder="新しい連絡方法をカンマ区切りで入力（例: メール, Chatwork）"
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">メモ</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
