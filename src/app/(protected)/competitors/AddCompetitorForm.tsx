'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddCompetitorForm() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setStatus('loading')
    setError('')

    const res = await fetch('/api/competitors/fetch-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() }),
    })
    const json = await res.json()

    if (!res.ok) {
      setStatus('error')
      setError(json.error ?? 'エラーが発生しました')
      return
    }

    setUrl('')
    setStatus('idle')
    router.push(`/competitors/${json.competitor.id}`)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-700 mb-1">競合動画を追加</h2>
      <p className="text-xs text-slate-400 mb-4">TikTok の動画URLを貼り付けてください</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.tiktok.com/@user/video/..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !url.trim()}
          className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? '取得中...' : '追加 →'}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </form>
    </div>
  )
}
