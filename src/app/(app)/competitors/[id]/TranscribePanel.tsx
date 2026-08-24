'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function TranscribePanel({
  competitorId,
  currentTranscript,
}: {
  competitorId: string
  currentTranscript: string
}) {
  const [transcript, setTranscript] = useState(currentTranscript)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFile(file: File) {
    setStatus('uploading')
    setMessage('')

    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
    const data = await res.json()

    if (!res.ok) {
      setStatus('error')
      setMessage(data.error ?? '文字起こしに失敗しました')
      return
    }

    const text: string = data.transcript
    setTranscript(text)
    setStatus('saving')

    // Supabaseに保存
    await fetch('/api/competitors/save-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competitor_id: competitorId, transcript: text }),
    })

    setStatus('done')
    setMessage('文字起こし完了')
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {/* ファイルアップロードエリア */}
      <div
        className="border-2 border-dashed border-neutral-800 hover:border-neutral-500/60 rounded-lg p-5 text-center cursor-pointer transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*,audio/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />
        {status === 'uploading' || status === 'saving' ? (
          <p className="text-sm text-neutral-300 animate-pulse">
            {status === 'uploading' ? '文字起こし中...' : '保存中...'}
          </p>
        ) : (
          <>
            <p className="text-xl mb-1">🎬</p>
            <p className="text-sm text-neutral-500">MP4 / 音声ファイルをアップロード</p>
            <p className="text-xs text-neutral-500 mt-0.5">クリックまたはドラッグ＆ドロップ</p>
          </>
        )}
      </div>

      {message && (
        <p className={`text-xs ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}

      {/* 文字起こし結果 */}
      <textarea
        value={transcript}
        onChange={e => setTranscript(e.target.value)}
        rows={8}
        placeholder="文字起こし結果がここに表示されます（手動編集も可能）"
        className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white text-sm text-white focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
      />
      {transcript !== currentTranscript && (
        <button
          onClick={async () => {
            await fetch('/api/competitors/save-transcript', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ competitor_id: competitorId, transcript }),
            })
            router.refresh()
          }}
          className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-white/10 transition-colors"
        >
          保存
        </button>
      )}
    </div>
  )
}
