export type Account = {
  id: string
  user_id: string
  tiktok_open_id: string
  tiktok_username: string | null
  tiktok_display_name: string | null
  tiktok_avatar_url: string | null
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  created_at: string
  updated_at: string
}

export type Script = {
  id: string
  user_id: string
  title: string
  content: string | null
  category: string | null
  hook: string | null
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  user_id: string
  script_id: string | null
  account_id: string
  tiktok_video_id: string
  tiktok_title: string | null
  posted_at: string | null
  created_at: string
}

export type PostMetric = {
  id: string
  post_id: string
  recorded_at: string
  views: number
  likes: number
  comments: number
  shares: number
}

export type PostWithMetrics = Post & {
  post_metrics: PostMetric[]
  accounts: Pick<Account, 'tiktok_username' | 'tiktok_display_name'>
}

export type ScriptAnalytics = Script & {
  post_count: number
  initial_views: number
  initial_likes: number
  initial_comments: number
  initial_shares: number
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
}
