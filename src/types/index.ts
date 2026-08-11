export type Account = {
  id: string
  tiktok_open_id: string | null
  tiktok_username: string | null
  tiktok_display_name: string | null
  tiktok_avatar_url: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  birthday: string | null
  tts_value: string | null
  ekyc_value: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Script = {
  id: string
  operator_member_id: string | null
  title: string
  content: string | null
  category: string | null
  hook: string | null
  created_at: string
  updated_at: string
}
