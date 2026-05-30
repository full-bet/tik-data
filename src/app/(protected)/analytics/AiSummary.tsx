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
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-700">AI サマリー</h2>
        <button
          onClick={generate}
          disabled={loading}
          className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '生成中...' : '✨ 生成'}
        </button>
      </div>
      {summary ? (
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
      ) : (
        <p className="text-sm text-slate-400">
          「生成」ボタンを押すと最新インポートのデータをAIが分析します
        </p>
      )}
    </div>
  )
}
