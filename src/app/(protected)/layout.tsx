import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/lib/actions'

const navItems = [
  { href: '/items', label: '投稿管理', icon: '📋' },
  { href: '/analytics', label: 'アナリティクス', icon: '📊' },
  { href: '/accounts', label: 'TikTokアカウント', icon: '🔗' },
  { href: '/docs', label: 'ドキュメント', icon: '📄' },
]

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-slate-800">
          <p className="text-white font-bold text-base">TikTok Analytics</p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{user.email}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition-colors"
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors text-left"
            >
              <span>🚪</span>ログアウト
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
