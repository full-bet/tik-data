import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseXlsxBuffer } from '@/lib/xlsx-parser'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = await file.arrayBuffer()

  // Create import record
  const { data: rec, error: recErr } = await supabase
    .from('analytics_imports')
    .insert({ filename: file.name, status: 'processing' })
    .select()
    .single()
  if (recErr || !rec) return NextResponse.json({ error: 'DB error' }, { status: 500 })

  try {
    const rows = parseXlsxBuffer(buffer)
    if (rows.length === 0) {
      await supabase.from('analytics_imports')
        .update({ status: 'error', error_message: '認識できる列が見つかりませんでした' })
        .eq('id', rec.id)
      return NextResponse.json({ error: 'No recognizable columns' }, { status: 400 })
    }

    // ---- items の upsert ----
    // 既存アイテムを tiktok_video_id で一括取得
    const videoIds = rows.map(r => r.video_id).filter(Boolean) as string[]
    const { data: existingItems } = videoIds.length
      ? await supabase.from('items').select('id,tiktok_video_id')
          .in('tiktok_video_id', videoIds)
      : { data: [] }

    const existingMap = new Map((existingItems ?? []).map(i => [i.tiktok_video_id, i.id]))

    // 動画ごとに item_id を解決（なければ作成）
    const rowsWithItemId: Array<typeof rows[0] & { item_id: string }> = []

    for (const row of rows) {
      let itemId = row.video_id ? existingMap.get(row.video_id) : undefined

      if (!itemId) {
        // 新規作成
        const postedAt = row.post_date ? parsePostDate(row.post_date) : null
        const { data: newItem } = await supabase.from('items').insert({
          tiktok_video_id: row.video_id ?? null,
          video_title:     row.video_title ?? '無題',
          posted_at:       postedAt,
          views:           row.views           ?? 0,
          likes:           row.likes           ?? 0,
          followers_gained: row.new_followers  ?? 0,
        }).select('id').single()

        if (newItem) {
          itemId = newItem.id
          if (row.video_id) existingMap.set(row.video_id, itemId)
        }
      } else {
        // 既存アイテムの指標を更新
        await supabase.from('items').update({
          views:            row.views           ?? 0,
          likes:            row.likes           ?? 0,
          followers_gained: row.new_followers   ?? 0,
          updated_at:       new Date().toISOString(),
        }).eq('id', itemId)
      }

      if (itemId) rowsWithItemId.push({ ...row, item_id: itemId })
    }

    // ---- snapshots 挿入 ----
    const snapshots = rowsWithItemId.map(r => ({
      import_id:       rec.id,
      item_id:         r.item_id,
      video_title:     r.video_title      ?? null,
      video_id:        r.video_id         ?? null,
      post_date:       r.post_date        ?? null,
      duration:        r.duration         ?? null,
      views:           r.views            ?? 0,
      likes:           r.likes            ?? 0,
      comments:        r.comments         ?? 0,
      shares:          r.shares           ?? 0,
      reach:           r.reach            ?? 0,
      watch_time_mins: r.watch_time_mins  ?? 0,
      profile_views:   r.profile_views    ?? 0,
      new_followers:   r.new_followers    ?? 0,
      gmv:             r.gmv              ?? 0,
      direct_gmv:      r.direct_gmv       ?? 0,
      items_sold:      r.items_sold       ?? 0,
      ctr:             r.ctr              ?? 0,
      completion_rate: r.completion_rate  ?? 0,
    }))

    for (let i = 0; i < snapshots.length; i += 500) {
      await supabase.from('analytics_snapshots').insert(snapshots.slice(i, i + 500))
    }

    await supabase.from('analytics_imports').update({
      status:      'done',
      processed_at: new Date().toISOString(),
      row_count:   rows.length,
    }).eq('id', rec.id)

    return NextResponse.json({ success: true, rows: rows.length, import_id: rec.id })
  } catch (e) {
    await supabase.from('analytics_imports')
      .update({ status: 'error', error_message: String(e) })
      .eq('id', rec.id)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

/** "2026-05-29 13:36" や "2026-05-29T13:36" 形式をパース */
function parsePostDate(s: string): string | null {
  try {
    const normalized = s.replace(' ', 'T')
    const d = new Date(normalized)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch {
    return null
  }
}
