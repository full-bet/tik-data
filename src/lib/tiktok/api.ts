const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2'

type TokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  open_id: string
  scope: string
}

type UserInfo = {
  open_id: string
  union_id: string
  avatar_url: string
  display_name: string
  username: string
}

type VideoData = {
  id: string
  title: string
  create_time: number
  like_count: number
  comment_count: number
  share_count: number
  view_count: number
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    code,
    grant_type: 'authorization_code',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/tiktok/callback`,
  })

  const res = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error_description || data.error)
  return data
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const res = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error_description || data.error)
  return data
}

export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await fetch(
    `${TIKTOK_API_BASE}/user/info/?fields=open_id,union_id,avatar_url,display_name,username`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const data = await res.json()
  if (data.error?.code && data.error.code !== 'ok') throw new Error(data.error.message)
  return data.data.user
}

export async function getVideoMetrics(
  accessToken: string,
  videoIds: string[]
): Promise<VideoData[]> {
  const res = await fetch(
    `${TIKTOK_API_BASE}/video/query/?fields=id,title,create_time,like_count,comment_count,share_count,view_count`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters: { video_ids: videoIds } }),
    }
  )
  const data = await res.json()
  if (data.error?.code && data.error.code !== 'ok') throw new Error(data.error.message)
  return data.data?.videos ?? []
}

export async function listUserVideos(accessToken: string): Promise<VideoData[]> {
  const res = await fetch(
    `${TIKTOK_API_BASE}/video/list/?fields=id,title,create_time,like_count,comment_count,share_count,view_count`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ max_count: 20 }),
    }
  )
  const data = await res.json()
  if (data.error?.code && data.error.code !== 'ok') throw new Error(data.error.message)
  return data.data?.videos ?? []
}

export function buildOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    response_type: 'code',
    scope: 'user.info.basic,video.list',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/tiktok/callback`,
    state,
  })
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`
}

export function extractVideoId(input: string): string | null {
  const urlMatch = input.match(/\/video\/(\d+)/)
  if (urlMatch) return urlMatch[1]
  if (/^\d+$/.test(input.trim())) return input.trim()
  return null
}
