import * as XLSX from 'xlsx'

export interface VideoRow {
  video_title?: string
  video_id?: string
  post_date?: string | null
  views?: number
  likes?: number
  comments?: number
  shares?: number
  reach?: number
  watch_time_mins?: number
  profile_views?: number
  new_followers?: number
}

// Japanese and English column name variants from TikTok Creator Center export
const COL_MAP: Record<string, keyof VideoRow> = {
  '動画タイトル': 'video_title', 'タイトル': 'video_title',
  'Video title': 'video_title', 'Title': 'video_title',
  '動画ID': 'video_id', 'Video ID': 'video_id', 'video id': 'video_id',
  '投稿日時': 'post_date', '投稿日': 'post_date',
  'Post time': 'post_date', 'Posted at': 'post_date',
  '動画再生数': 'views', '再生数': 'views',
  'Video views': 'views', 'Views': 'views',
  'いいね数': 'likes', 'いいね': 'likes', 'Likes': 'likes',
  'コメント数': 'comments', 'Comments': 'comments',
  'シェア数': 'shares', 'Shares': 'shares',
  'リーチ': 'reach', 'Reach': 'reach',
  '合計視聴時間（分）': 'watch_time_mins', '合計再生時間': 'watch_time_mins',
  'Total play time (min)': 'watch_time_mins', 'Watch time (minutes)': 'watch_time_mins',
  'プロフィール閲覧数': 'profile_views', 'Profile views': 'profile_views',
  'フォロワー増加数': 'new_followers', 'New followers': 'new_followers',
}

function toNum(v: unknown): number {
  if (v == null) return 0
  const n = Number(String(v).replace(/,/g, ''))
  return isNaN(n) ? 0 : Math.floor(n)
}

export function parseXlsxBuffer(buffer: ArrayBuffer): VideoRow[] {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true })

  // Pick the sheet with the most rows (skips overview sheets)
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

  const raw = XLSX.utils.sheet_to_json(bestSheet, { defval: null }) as Record<string, unknown>[]

  const results: VideoRow[] = []
  for (const row of raw) {
    const r: VideoRow = {}
    for (const [key, value] of Object.entries(row)) {
      const field = COL_MAP[key.trim()]
      if (!field) continue
      if (field === 'video_title' || field === 'video_id') {
        r[field] = value != null ? String(value) : undefined
      } else if (field === 'post_date') {
        r.post_date = value != null ? String(value) : null
      } else {
        ;(r as Record<string, number>)[field] = toNum(value)
      }
    }
    // Only include rows with at least some data
    if (r.video_title || r.video_id || (r.views ?? 0) > 0) {
      results.push(r)
    }
  }

  return results
}
