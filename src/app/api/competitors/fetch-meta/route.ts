import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json() as { url: string }
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  // TikTok oEmbed API でメタデータ取得
  let title: string | null = null
  let creator: string | null = null
  let thumbnail: string | null = null

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (res.ok) {
      const data = await res.json()
      title    = data.title        ?? null
      creator  = data.author_name  ?? null
      thumbnail = data.thumbnail_url ?? null
    }
  } catch {
    // メタデータ取得失敗は無視（URLだけで登録）
  }

  // competitors テーブルに保存
  const { data: competitor, error } = await supabase
    .from('competitors')
    .insert({
      user_id:       user.id,
      url,
      video_title:   title,
      creator_name:  creator,
      thumbnail_url: thumbnail,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ competitor })
}
