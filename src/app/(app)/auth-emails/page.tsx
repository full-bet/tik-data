import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AuthEmailsPage() {
  const supabase = await createClient()

  const { data: authEmails } = await supabase
    .from('auth_emails')
    .select('id,email,notes,created_at')
    .order('created_at', { ascending: false })

  const emailIds = (authEmails ?? []).map(e => e.id)

  const { data: linksRaw } = emailIds.length
    ? await supabase.from('auth_email_devices').select('auth_email_id,devices(name)').in('auth_email_id', emailIds)
    : { data: [] }

  type LinkRow = { auth_email_id: string; devices: { name: string } | null }
  const links = (linksRaw ?? []) as unknown as LinkRow[]

  const devicesByEmail = new Map<string, string[]>()
  for (const link of links) {
    const name = link.devices?.name
    if (!name) continue
    devicesByEmail.set(link.auth_email_id, [...(devicesByEmail.get(link.auth_email_id) ?? []), name])
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">認証メアド</h1>
          <p className="text-neutral-500 text-sm mt-1">{authEmails?.length ?? 0}件</p>
        </div>
        <Link
          href="/auth-emails/new"
          className="px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {!authEmails || authEmails.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-16 text-center">
          <p className="text-4xl mb-4">✉️</p>
          <p className="text-neutral-400 font-medium">認証メアドがまだ登録されていません</p>
          <Link
            href="/auth-emails/new"
            className="inline-block mt-4 px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600"
          >
            最初の認証メアドを追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {authEmails.map(e => (
            <div key={e.id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
              <p className="font-semibold text-white">{e.email}</p>
              <p className="text-neutral-500 text-sm mt-1">
                ログイン端末: {(devicesByEmail.get(e.id) ?? []).join(' / ') || 'なし'}
              </p>
              {e.notes && <p className="text-neutral-400 text-sm mt-2">{e.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
