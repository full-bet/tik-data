'use client'

import { useState, useRef } from 'react'
import { updateItemField } from '../actions'

export default function TranscribeUpload({ itemId }: { itemId: string }) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      setStatus('error')
      setMessage('動画または音声ファイルを選択してください')
      return
    }

    setStatus('uploading')
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setStatus('error')
      setMessage(data.error ?? '文字起こしに失敗しました')
      return
    }

    await updateItemField(itemId, 'script_content', data.transcript)
    setStatus('done')
    setMessage('文字起こし完了。台本欄に反映されました。')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="mb-4">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          status === 'uploading'
            ? 'border-neutral-500/40 bg-neutral-500/10'
            : status === 'done'
            ? 'border-green-500/40 bg-green-500/10'
            : status === 'error'
            ? 'border-red-500/40 bg-red-500/10'
            : 'border-neutral-800 hover:border-neutral-500/60 hover:bg-white/5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*,audio/*"
          className="hidden"
          onChange={handleChange}
        />

        {status === 'uploading' ? (
          <div className="space-y-2">
            <div className="w-6 h-6 border-2 border-neutral-500/60 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-neutral-300">文字起こし中...</p>
          </div>
        ) : status === 'done' ? (
          <div className="space-y-1">
            <p className="text-2xl">✅</p>
            <p className="text-sm text-green-400 font-medium">{message}</p>
            <p className="text-xs text-neutral-500">別のファイルを選択して上書きもできます</p>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-1">
            <p className="text-2xl">⚠️</p>
            <p className="text-sm text-red-400">{message}</p>
            <p className="text-xs text-neutral-500">クリックして再試行</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl">🎬</p>
            <p className="text-sm text-neutral-400 font-medium">MP4をドラッグ＆ドロップ</p>
            <p className="text-xs text-neutral-500">またはクリックしてファイルを選択</p>
          </div>
        )}
      </div>
    </div>
  )
}
