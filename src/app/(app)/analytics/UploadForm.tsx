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
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
      <h2 className="font-semibold text-neutral-300 mb-3">データをインポート</h2>
      <p className="text-xs text-neutral-500 mb-4">
        TikTokクリエイターセンター → アナリティクス → エクスポートしたxlsxファイルをアップロードしてください
      </p>

      <div
        className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-500 hover:bg-white/5 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
      >
        {status === 'uploading' ? (
          <p className="text-sm text-neutral-300 animate-pulse">処理中...</p>
        ) : (
          <>
            <p className="text-3xl mb-2">📂</p>
            <p className="text-sm text-neutral-400">クリックまたはドラッグ＆ドロップ</p>
            <p className="text-xs text-neutral-500 mt-1">.xlsx ファイル</p>
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
        <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {status === 'done' ? '✓ ' : '✗ '}{message}
        </p>
      )}
    </div>
  )
}
