import * as XLSX from 'xlsx'

export interface VideoRow {
  video_title?: string
  video_id?: string
  post_date?: string | null
  duration?: string | null
  views?: number
  likes?: number
  comments?: number
  shares?: number
  reach?: number
  watch_time_mins?: number
  profile_views?: number
  new_followers?: number
  gmv?: number
  direct_gmv?: number
  items_sold?: number
  ctr?: number
  completion_rate?: number
}

// Lowercase → field mapping (case-insensitive matching)
const COL_MAP: Record<string, keyof VideoRow> = {
  'video name': 'video_title',
  'video title': 'video_title',
  'title': 'video_title',
  '動画タイトル': 'video_title',
  'タイトル': 'video_title',

  'id': 'video_id',
  'video id': 'video_id',
  '動画id': 'video_id',

  'posted': 'post_date',
  'post time': 'post_date',
  '投稿日時': 'post_date',
  '投稿日': 'post_date',

  'duration': 'duration',
  '動画時間': 'duration',
  '尺': 'duration',

  'views': 'views',
  'video views': 'views',
  '動画再生数': 'views',
  '再生数': 'views',

  'likes': 'likes',
  'いいね数': 'likes',

  'comments': 'comments',
  'コメント数': 'comments',

  'shares': 'shares',
  'シェア数': 'shares',

  'reach': 'reach',
  'リーチ': 'reach',

  'total play time (min)': 'watch_time_mins',
  'watch time (minutes)': 'watch_time_mins',
  '合計視聴時間（分）': 'watch_time_mins',

  'profile views': 'profile_views',
  'プロフィール閲覧数': 'profile_views',

  'new followers': 'new_followers',
  'フォロワー増加数': 'new_followers',

  'gmv': 'gmv',
  'direct gmv': 'direct_gmv',

  'items sold': 'items_sold',
  '販売個数': 'items_sold',

  'ctr': 'ctr',

  'completion': 'completion_rate',
  'completion rate': 'completion_rate',
  '完了率': 'completion_rate',
}

/** 正規化：不可視文字・BOM・前後空白を除去してlowercase */
function normalize(s: string): string {
  return s
    .replace(/^﻿/, '')          // BOM
    .replace(/[​-‍﻿]/g, '') // zero-width chars
    .trim()
    .toLowerCase()
}

/** 数値テキストを数値に変換（「円」「%」「,」除去） */
function toNum(v: unknown): number {
  if (v == null) return 0
  const s = String(v).replace(/[円,%\s]/g, '').trim()
  const n = Number(s)
  return isNaN(n) ? 0 : n
}

/** シート全行から「認識できる列が最も多い行」をヘッダー行として探す */
function findHeaderRow(rows: unknown[][]): number {
  let bestScore = 0
  let bestIdx = 0
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i] as unknown[]
    const score = row.filter(cell =>
      cell != null && COL_MAP[normalize(String(cell))] !== undefined
    ).length
    if (score > bestScore) { bestScore = score; bestIdx = i }
  }
  return bestIdx
}

export function parseXlsxBuffer(buffer: ArrayBuffer): VideoRow[] {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true })

  // シートの中で行数が最も多いものを選ぶ
  let bestSheet: XLSX.WorkSheet | null = null
  let bestCount = 0
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name]
    const ref = sheet['!ref']
    if (!ref) continue
    const range = XLSX.utils.decode_range(ref)
    const rows = range.e.r - range.s.r + 1
    if (rows > bestCount) { bestCount = rows; bestSheet = sheet }
  }
  if (!bestSheet) return []

  // header:1 で全セルを生の2次元配列として取得
  const allRows = XLSX.utils.sheet_to_json(bestSheet, {
    header: 1,
    defval: null,
  }) as unknown[][]

  // ヘッダー行を動的に探す
  const headerIdx = findHeaderRow(allRows)
  const headerRow = allRows[headerIdx] as unknown[]

  // 列インデックス → フィールド名 のマップを構築
  const colIndexToField = new Map<number, keyof VideoRow>()
  headerRow.forEach((cell, idx) => {
    if (cell == null) return
    const field = COL_MAP[normalize(String(cell))]
    if (field) colIndexToField.set(idx, field)
  })

  if (colIndexToField.size === 0) return []

  // ヘッダー行の次の行からデータを読む
  const results: VideoRow[] = []
  for (let i = headerIdx + 1; i < allRows.length; i++) {
    const row = allRows[i] as unknown[]
    if (!row || row.every(c => c == null)) continue

    const r: VideoRow = {}
    colIndexToField.forEach((field, idx) => {
      const value = row[idx]
      if (field === 'video_title') {
        r.video_title = value != null ? String(value) : undefined
      } else if (field === 'video_id') {
        r.video_id = value != null ? String(value) : undefined
      } else if (field === 'post_date' || field === 'duration') {
        r[field] = value != null ? String(value) : null
      } else {
        ;(r as Record<string, number>)[field] = toNum(value)
      }
    })

    if (r.video_title || r.video_id || (r.views ?? 0) > 0) {
      results.push(r)
    }
  }

  return results
}
