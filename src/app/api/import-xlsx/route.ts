import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseXlsxBuffer } from '@/lib/xlsx-parser'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = await file.arrayBuffer()

  // Create import record
  const { data: rec, error: recErr } = await supabase
    .from('analytics_imports')
    .insert({ user_id: user.id, filename: file.name, status: 'processing' })
    .select()
    .single()

  if (recErr || !rec) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  try {
    const rows = parseXlsxBuffer(buffer)

    if (rows.length === 0) {
      await supabase.from('analytics_imports')
        .update({ status: 'error', error_message: '認識できる列が見つかりませんでした' })
        .eq('id', rec.id)
      return NextResponse.json({ error: 'No recognizable columns' }, { status: 400 })
    }

    const snapshots = rows.map(r => ({
      user_id: user.id,
      import_id: rec.id,
      video_title:     r.video_title     ?? null,
      video_id:        r.video_id        ?? null,
      post_date:       r.post_date       ?? null,
      views:           r.views           ?? 0,
      likes:           r.likes           ?? 0,
      comments:        r.comments        ?? 0,
      shares:          r.shares          ?? 0,
      reach:           r.reach           ?? 0,
      watch_time_mins: r.watch_time_mins ?? 0,
      profile_views:   r.profile_views   ?? 0,
      new_followers:   r.new_followers   ?? 0,
    }))

    // Insert in batches of 500
    for (let i = 0; i < snapshots.length; i += 500) {
      await supabase.from('analytics_snapshots').insert(snapshots.slice(i, i + 500))
    }

    await supabase.from('analytics_imports').update({
      status: 'done',
      processed_at: new Date().toISOString(),
      row_count: rows.length,
    }).eq('id', rec.id)

    return NextResponse.json({ success: true, rows: rows.length, import_id: rec.id })
  } catch (e) {
    await supabase.from('analytics_imports')
      .update({ status: 'error', error_message: String(e) })
      .eq('id', rec.id)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
