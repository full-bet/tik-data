'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyzePanel({
  competitorId,
  hasAnalysis,
}: {
  competitorId: string
  hasAnalysis: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function analyze() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/competitors/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competitor_id: competitorId }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'エラーが発生しました'); return }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={analyze}
        disabled={loading}
        className="px-4 py-2 bg-neutral-700 text-white text-sm font-medium rounded-lg hover:bg-neutral-600 disabled:opacity-50 transition-colors"
      >
        {loading ? '分析中...' : hasAnalysis ? '✨ 再分析' : '✨ AI分析を実行'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
