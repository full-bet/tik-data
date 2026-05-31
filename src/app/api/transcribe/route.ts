export const maxDuration = 120

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'OPENAI_API_KEY が未設定です' },
      { status: 501 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return Response.json({ error: 'ファイルが見つかりません' }, { status: 400 })
  }

  const whisperForm = new FormData()
  whisperForm.append('file', file)
  whisperForm.append('model', 'whisper-1')
  whisperForm.append('language', 'ja')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: whisperForm,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return Response.json(
      { error: err?.error?.message ?? `Whisper APIエラー (${res.status})` },
      { status: res.status }
    )
  }

  const data = await res.json()
  return Response.json({ transcript: data.text })
}
