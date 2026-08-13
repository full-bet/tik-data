'use client'

import { useState } from 'react'
import Link from 'next/link'

const navItems = [
  { href: '/items', label: '投稿管理', icon: '📋' },
  { href: '/scripts', label: '台本', icon: '📝' },
  { href: '/tests', label: 'テスト', icon: '🧪' },
  { href: '/casts', label: 'キャスト', icon: '🧑' },
  { href: '/deals', label: '商材', icon: '💼' },
  { href: '/materials', label: '素材', icon: '🎞️' },
  { href: '/devices', label: '端末', icon: '📱' },
  { href: '/analytics', label: 'アナリティクス', icon: '📊' },
  { href: '/competitors', label: '競合分析', icon: '🔍' },
  { href: '/accounts', label: 'アカウント', icon: '🔗' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-slate-900 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-white font-bold text-base">素材・台本DB</p>
          </div>
          <button
            className="lg:hidden ml-2 shrink-0 text-slate-400 hover:text-white p-1 rounded"
            onClick={() => setOpen(false)}
            aria-label="メニューを閉じる"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition-colors"
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

      </aside>

      {/* Main wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="text-white p-1 -ml-1 hover:bg-slate-800 rounded"
            aria-label="メニューを開く"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="5" x2="17" y2="5" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="15" x2="17" y2="15" />
            </svg>
          </button>
          <p className="text-white font-bold text-sm">素材・台本DB</p>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
