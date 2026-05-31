'use client'

import { useState, useRef } from 'react'
import { updateCompetitorField } from '../actions'

export default function CompetitorTranscribeUpload({ videoId }: { videoId: string }) {
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

    await updateCompetitorField(videoId, 'script_content', data.transcript)
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
            ? 'border-indigo-300 bg-indigo-50'
            : status === 'done'
            ? 'border-green-300 bg-green-50'
            : status === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
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
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-indigo-600">文字起こし中...</p>
          </div>
        ) : status === 'done' ? (
          <div className="space-y-1">
            <p className="text-2xl">✅</p>
            <p className="text-sm text-green-700 font-medium">{message}</p>
            <p className="text-xs text-slate-400">別のファイルを選択して上書きもできます</p>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-1">
            <p className="text-2xl">⚠️</p>
            <p className="text-sm text-red-600">{message}</p>
            <p className="text-xs text-slate-400">クリックして再試行</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl">🎬</p>
            <p className="text-sm text-slate-600 font-medium">MP4をドラッグ＆ドロップ</p>
            <p className="text-xs text-slate-400">またはクリックしてファイルを選択</p>
          </div>
        )}
      </div>
    </div>
  )
}
