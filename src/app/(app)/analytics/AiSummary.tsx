'use client'

import { useState } from 'react'

export default function AiSummary({ importId }: { importId: string }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    setSummary('')
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ import_id: importId }),
      })
      const json = await res.json()
      setSummary(json.summary ?? json.error ?? 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-neutral-300">AI サマリー</h2>
        <button
          onClick={generate}
          disabled={loading}
          className="px-3 py-1.5 bg-neutral-700 text-white text-xs font-medium rounded-lg hover:bg-neutral-600 disabled:opacity-50 transition-colors"
        >
          {loading ? '生成中...' : '✨ 生成'}
        </button>
      </div>
      {summary ? (
        <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
      ) : (
        <p className="text-sm text-neutral-500">
          「生成」ボタンを押すと最新インポートのデータをAIが分析します
        </p>
      )}
    </div>
  )
}
