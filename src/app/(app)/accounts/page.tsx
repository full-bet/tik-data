import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

const CLASSIFICATION_OPTIONS = [
  { value: 'main', label: '本アカウント' },
  { value: 'reply', label: 'リプライ用' },
  { value: 'other', label: 'その他' },
] as const

async function updateAccountClassifications(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const accountId = formData.get('account_id') as string
  const newTypes = new Set(formData.getAll('types') as string[])

  const { data: existing } = await supabase.from('account_classifications').select('id,type').eq('account_id', accountId)
  const currentTypes = new Set((existing ?? []).map(r => r.type))

  const toRemove = (existing ?? []).filter(r => !newTypes.has(r.type)).map(r => r.id)
  if (toRemove.length > 0) {
    await supabase.from('account_classifications').delete().in('id', toRemove)
  }

  const toAdd = [...newTypes].filter(t => !currentTypes.has(t))
  if (toAdd.length > 0) {
    await supabase.from('account_classifications').insert(toAdd.map(type => ({ account_id: accountId, type })))
  }

  revalidatePath('/accounts')
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const supabase = await createClient()

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })

  const accountIds = (accounts ?? []).map(a => a.id)
  const { data: classifications } = accountIds.length
    ? await supabase.from('account_classifications').select('account_id,type').in('account_id', accountIds)
    : { data: [] }

  const classificationsByAccount = new Map<string, Set<string>>()
  for (const c of classifications ?? []) {
    classificationsByAccount.set(c.account_id, (classificationsByAccount.get(c.account_id) ?? new Set()).add(c.type))
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">TikTokアカウント</h1>
          <p className="text-neutral-500 text-sm mt-1">連携中のアカウントを管理する</p>
        </div>
        <Link
          href="/tiktok/connect"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + アカウントを連携
        </Link>
      </div>

      {success === 'connected' && (
        <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          TikTokアカウントを連携しました
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          連携に失敗しました。再度お試しください。
        </div>
      )}

      {!accounts || accounts.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-16 text-center">
          <p className="text-4xl mb-4">🔗</p>
          <p className="text-neutral-400 font-medium">連携中のアカウントがありません</p>
          <p className="text-neutral-500 text-sm mt-2">TikTokアカウントを連携して動画データを取得しましょう</p>
          <Link
            href="/tiktok/connect"
            className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            アカウントを連携する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(account => {
            const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null
            const isExpired = expiresAt ? expiresAt < new Date() : false

            const currentTypes = classificationsByAccount.get(account.id) ?? new Set<string>()

            return (
              <div key={account.id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
              <div className="flex items-center gap-4">
                {account.tiktok_avatar_url ? (
                  <img
                    src={account.tiktok_avatar_url}
                    alt={account.tiktok_display_name ?? ''}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center text-xl">
                    👤
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">
                    {account.tiktok_display_name ?? account.tiktok_username}
                  </p>
                  {account.tiktok_username && (
                    <p className="text-neutral-500 text-sm">@{account.tiktok_username}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    連携日: {new Date(account.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>

                <div className="text-right">
                  {isExpired ? (
                    <div>
                      <span className="inline-block px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs font-medium">
                        トークン期限切れ
                      </span>
                      <div className="mt-2">
                        <Link
                          href="/tiktok/connect"
                          className="text-xs text-indigo-400 hover:underline"
                        >
                          再連携する
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-medium">
                      連携中
                    </span>
                  )}
                </div>
              </div>

              <form action={updateAccountClassifications} className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-neutral-800">
                <input type="hidden" name="account_id" value={account.id} />
                <span className="text-xs text-neutral-500">分類:</span>
                {CLASSIFICATION_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      name="types"
                      value={opt.value}
                      defaultChecked={currentTypes.has(opt.value)}
                      className="accent-indigo-600"
                    />
                    {opt.label}
                  </label>
                ))}
                <button type="submit" className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded text-xs transition-colors">
                  保存
                </button>
              </form>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-amber-800 text-sm font-medium">TikTok APIについて</p>
        <p className="text-amber-400 text-xs mt-1">
          TikTok Display APIのアクセストークンは24時間で期限切れになります。
          期限切れの場合は再連携してください。データ取得は毎日深夜1時（JST）に自動実行されます。
        </p>
      </div>
    </div>
  )
}
