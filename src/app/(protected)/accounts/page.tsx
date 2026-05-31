import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">TikTokアカウント</h1>
          <p className="text-slate-500 text-sm mt-1">連携中のアカウントを管理する</p>
        </div>
        <Link
          href="/tiktok/connect"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + アカウントを連携
        </Link>
      </div>

      {success === 'connected' && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          TikTokアカウントを連携しました
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          連携に失敗しました。再度お試しください。
        </div>
      )}

      {!accounts || accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <p className="text-4xl mb-4">🔗</p>
          <p className="text-slate-600 font-medium">連携中のアカウントがありません</p>
          <p className="text-slate-400 text-sm mt-2">TikTokアカウントを連携して動画データを取得しましょう</p>
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

            return (
              <div key={account.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                {account.tiktok_avatar_url ? (
                  <img
                    src={account.tiktok_avatar_url}
                    alt={account.tiktok_display_name ?? ''}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl">
                    👤
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">
                    {account.tiktok_display_name ?? account.tiktok_username}
                  </p>
                  {account.tiktok_username && (
                    <p className="text-slate-500 text-sm">@{account.tiktok_username}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    連携日: {new Date(account.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>

                <div className="text-right">
                  {isExpired ? (
                    <div>
                      <span className="inline-block px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium">
                        トークン期限切れ
                      </span>
                      <div className="mt-2">
                        <Link
                          href="/tiktok/connect"
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          再連携する
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-medium">
                      連携中
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800 text-sm font-medium">TikTok APIについて</p>
        <p className="text-amber-700 text-xs mt-1">
          TikTok Display APIのアクセストークンは24時間で期限切れになります。
          期限切れの場合は再連携してください。データ取得は毎日深夜1時（JST）に自動実行されます。
        </p>
      </div>
    </div>
  )
}
