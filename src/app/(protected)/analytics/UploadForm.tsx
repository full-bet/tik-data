'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadForm() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFile(file: File) {
    setStatus('uploading')
    setMessage('')

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/import-xlsx', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(json.error ?? 'エラーが発生しました')
        return
      }

      setStatus('done')
      setMessage(`${json.rows}件のデータをインポートしました`)
      router.refresh()
    } catch {
      setStatus('error')
      setMessage('ネットワークエラー')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-700 mb-3">データをインポート</h2>
      <p className="text-xs text-slate-500 mb-4">
        TikTokクリエイターセンター → アナリティクス → エクスポートしたxlsxファイルをアップロードしてください
      </p>

      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
      >
        {status === 'uploading' ? (
          <p className="text-sm text-indigo-600 animate-pulse">処理中...</p>
        ) : (
          <>
            <p className="text-3xl mb-2">📂</p>
            <p className="text-sm text-slate-600">クリックまたはドラッグ＆ドロップ</p>
            <p className="text-xs text-slate-400 mt-1">.xlsx ファイル</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {message && (
        <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {status === 'done' ? '✓ ' : '✗ '}{message}
        </p>
      )}
    </div>
  )
}
