import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { competitor_id } = await req.json() as { competitor_id: string }

  const { data: comp } = await supabase
    .from('competitors')
    .select('transcript, video_title, creator_name')
    .eq('id', competitor_id)
    .single()

  if (!comp?.transcript) {
    return NextResponse.json({ error: '先に文字起こしを実行してください' }, { status: 400 })
  }

  const prompt = `以下はTikTok動画の文字起こしテキストです。
動画タイトル: ${comp.video_title ?? '不明'}
投稿者: ${comp.creator_name ?? '不明'}

【文字起こし】
${comp.transcript}

この動画の構成を以下のJSON形式で分析してください。
必ずJSONのみを返してください（コードブロック不要）:

{
  "hook": "冒頭フック（最初の3秒で視聴者を引きつける言葉・手法）",
  "problem": "提示している問題・共感ポイント",
  "solution": "提供している解決策・価値",
  "cta": "最後のCTA（行動喚起）",
  "structure": ["シーン1の説明", "シーン2の説明", "..."],
  "tone": "動画のトーン（例：共感型・権威型・ストーリー型）",
  "key_phrases": ["印象的なフレーズ1", "フレーズ2", "フレーズ3"],
  "summary": "150字以内の全体まとめ"
}`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'

  let parsed: Record<string, unknown> = {}
  try { parsed = JSON.parse(text) } catch { parsed = { summary: text } }

  // DBに保存
  await supabase.from('competitors').update({
    hook:       parsed.hook       as string ?? null,
    structure:  JSON.stringify(parsed.structure ?? []),
    cta:        parsed.cta        as string ?? null,
    ai_summary: parsed.summary    as string ?? null,
    updated_at: new Date().toISOString(),
  }).eq('id', competitor_id)

  return NextResponse.json({ analysis: parsed })
}
