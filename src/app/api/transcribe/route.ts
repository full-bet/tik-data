import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
  }

  // TODO: Whisper API キーが渡されたらここを実装
  // const apiKey = process.env.OPENAI_API_KEY
  // const whisperForm = new FormData()
  // whisperForm.append('file', file)
  // whisperForm.append('model', 'whisper-1')
  // whisperForm.append('language', 'ja')
  // const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${apiKey}` },
  //   body: whisperForm,
  // })
  // const data = await res.json()
  // return NextResponse.json({ transcript: data.text })

  return NextResponse.json(
    { error: 'Whisper APIキーが未設定です（OPENAI_API_KEY）' },
    { status: 501 }
  )
}
