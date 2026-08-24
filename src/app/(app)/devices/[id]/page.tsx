import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

async function linkAuthEmail(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const deviceId = formData.get('device_id') as string
  const authEmailId = formData.get('auth_email_id') as string
  if (!authEmailId) return

  await supabase.from('auth_email_devices').insert({ device_id: deviceId, auth_email_id: authEmailId })

  redirect(`/devices/${deviceId}?saved=1`)
}

async function unlinkAuthEmail(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const deviceId = formData.get('device_id') as string
  const linkId = formData.get('link_id') as string

  await supabase.from('auth_email_devices').delete().eq('id', linkId)

  redirect(`/devices/${deviceId}?saved=1`)
}

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: device }, { data: links }, { data: allAuthEmails }] = await Promise.all([
    supabase.from('devices').select('*,members(name)').eq('id', id).single(),
    supabase.from('auth_email_devices').select('id,auth_emails(id,email)').eq('device_id', id),
    supabase.from('auth_emails').select('id,email').order('email'),
  ])

  if (!device) notFound()

  type LinkRow = { id: string; auth_emails: { id: string; email: string } | null }
  const linkRows = (links ?? []) as unknown as LinkRow[]
  const linkedEmailIds = new Set(linkRows.map(l => l.auth_emails?.id).filter(Boolean))
  const availableEmails = (allAuthEmails ?? []).filter(e => !linkedEmailIds.has(e.id))

  return (
    <div className="p-4 sm:p-8 max-w-2xl space-y-6">
      <div>
        <Link href="/devices" className="text-neutral-500 hover:text-white text-sm">
          ← 端末一覧
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">{device.name}</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {device.owner_type === 'personal' ? '個人端末' : device.owner_type === 'company' ? '会社支給端末' : '所有区分未設定'}
          {device.members?.name ? ` / 担当: ${device.members.name}` : ''}
        </p>
        {device.usage_note && <p className="text-neutral-400 text-sm mt-2">{device.usage_note}</p>}
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <h2 className="font-semibold text-neutral-200 mb-4">ログイン中の認証メアド</h2>

        {linkRows.length > 0 ? (
          <div className="space-y-2 mb-5">
            {linkRows.map(l => (
              <div key={l.id} className="flex items-center justify-between px-3 py-2 border border-neutral-800 rounded-lg">
                <span className="text-sm text-white">{l.auth_emails?.email ?? '(削除済み)'}</span>
                <form action={unlinkAuthEmail}>
                  <input type="hidden" name="device_id" value={id} />
                  <input type="hidden" name="link_id" value={l.id} />
                  <button type="submit" className="text-xs text-red-400 hover:text-red-300">解除</button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm mb-5">ログイン中の認証メアドはありません</p>
        )}

        {availableEmails.length > 0 ? (
          <form action={linkAuthEmail} className="flex gap-2">
            <input type="hidden" name="device_id" value={id} />
            <select
              name="auth_email_id"
              required
              defaultValue=""
              className="flex-1 px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>認証メアドを選択</option>
              {availableEmails.map(e => (
                <option key={e.id} value={e.id}>{e.email}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              紐付け
            </button>
          </form>
        ) : (
          <p className="text-neutral-500 text-xs">
            紐付け可能な認証メアドがありません。<Link href="/auth-emails/new" className="text-indigo-400 hover:underline">先に追加してください</Link>
          </p>
        )}
      </div>
    </div>
  )
}
