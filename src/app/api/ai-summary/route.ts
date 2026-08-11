import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { import_id } = await req.json() as { import_id: string }

  const { data: snapshots } = await supabase
    .from('analytics_snapshots')
    .select('video_title,views,likes,comments,shares,reach,new_followers')
    .eq('import_id', import_id)
    .order('views', { ascending: false })
    .limit(20)

  if (!snapshots?.length) {
    return NextResponse.json({ error: 'No data' }, { status: 400 })
  }

  const totalViews = snapshots.reduce((s, r) => s + (r.views ?? 0), 0)
  const totalLikes = snapshots.reduce((s, r) => s + (r.likes ?? 0), 0)
  const totalFollowers = snapshots.reduce((s, r) => s + (r.new_followers ?? 0), 0)
  const top3 = snapshots.slice(0, 3).map(r => `「${r.video_title}」再生${r.views?.toLocaleString()}回`).join('、')

  const prompt = `TikTokアナリティクスデータ（${snapshots.length}本の動画）を分析してください。

合計再生数: ${totalViews.toLocaleString()}
合計いいね: ${totalLikes.toLocaleString()}
フォロワー増加: ${totalFollowers.toLocaleString()}
平均エンゲージメント率: ${totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : 0}%
トップ3動画: ${top3}

以下の観点で150字以内の日本語で簡潔にまとめてください：
1. 全体的なパフォーマンスの評価
2. 注目すべきトレンドや特徴
3. 改善のヒント（1点）`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ summary: text })
}
