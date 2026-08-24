import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function createAuthEmail(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const email = formData.get('email') as string
  if (!email?.trim()) return

  const { data } = await supabase
    .from('auth_emails')
    .insert({
      email: email.trim(),
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (data) redirect('/auth-emails')
}

export default function NewAuthEmailPage() {
  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/auth-emails" className="text-neutral-500 hover:text-white text-sm">
          ← 認証メアド一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">認証メアドを追加</h1>
      </div>

      <form action={createAuthEmail} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            メールアドレス <span className="text-red-400">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">メモ</label>
          <textarea
            name="notes"
            rows={2}
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
            href="/auth-emails"
            className="px-6 py-2 border border-neutral-700 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
