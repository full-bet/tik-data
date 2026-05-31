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

// TikTok Creator Center export column names (English + Japanese variants)
const COL_MAP: Record<string, keyof VideoRow> = {
  // video_title
  'Video name': 'video_title',
  'Video title': 'video_title',
  '動画タイトル': 'video_title',
  'タイトル': 'video_title',
  // video_id
  'ID': 'video_id',
  'Video ID': 'video_id',
  '動画ID': 'video_id',
  // post_date
  'Posted': 'post_date',
  'Post time': 'post_date',
  '投稿日時': 'post_date',
  '投稿日': 'post_date',
  // duration
  'Duration': 'duration',
  '動画時間': 'duration',
  '尺': 'duration',
  // views
  'Views': 'views',
  'Video views': 'views',
  '動画再生数': 'views',
  '再生数': 'views',
  // likes
  'Likes': 'likes',
  'いいね数': 'likes',
  // comments
  'Comments': 'comments',
  'コメント数': 'comments',
  // shares
  'Shares': 'shares',
  'シェア数': 'shares',
  // reach
  'Reach': 'reach',
  'リーチ': 'reach',
  // watch_time_mins
  'Total play time (min)': 'watch_time_mins',
  'Watch time (minutes)': 'watch_time_mins',
  '合計視聴時間（分）': 'watch_time_mins',
  // profile_views
  'Profile views': 'profile_views',
  'プロフィール閲覧数': 'profile_views',
  // new_followers
  'New followers': 'new_followers',
  'フォロワー増加数': 'new_followers',
  // GMV / commerce
  'GMV': 'gmv',
  'Direct GMV': 'direct_gmv',
  'Items sold': 'items_sold',
  '販売個数': 'items_sold',
  // rates
  'CTR': 'ctr',
  'Completion': 'completion_rate',
  'Completion rate': 'completion_rate',
  '完了率': 'completion_rate',
}

/** 数値テキストを数値に変換。「円」「%」「,」を除去 */
function toNum(v: unknown): number {
  if (v == null) return 0
  const s = String(v).replace(/[円,%]/g, '').trim()
  const n = Number(s)
  return isNaN(n) ? 0 : n
}

export function parseXlsxBuffer(buffer: ArrayBuffer): VideoRow[] {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true })

  // Pick the sheet with the most rows
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

      if (field === 'video_title') {
        r.video_title = value != null ? String(value) : undefined
      } else if (field === 'video_id') {
        r.video_id = value != null ? String(value) : undefined
      } else if (field === 'post_date' || field === 'duration') {
        r[field] = value != null ? String(value) : null
      } else {
        ;(r as Record<string, number>)[field] = toNum(value)
      }
    }
    if (r.video_title || r.video_id || (r.views ?? 0) > 0) {
      results.push(r)
    }
  }
  return results
}
