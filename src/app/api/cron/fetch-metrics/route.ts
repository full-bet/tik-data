import { createServiceClient } from '@/lib/supabase/server'
import { getVideoMetrics, refreshAccessToken } from '@/lib/tiktok/api'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: accounts } = await supabase.from('accounts').select('*')
  if (!accounts) return NextResponse.json({ ok: true, processed: 0 })

  let processed = 0
  let errors: string[] = []

  for (const account of accounts) {
    try {
      let accessToken = account.access_token

      const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null
      const needsRefresh = !expiresAt || expiresAt < new Date(Date.now() + 60 * 60 * 1000)

      if (needsRefresh && account.refresh_token) {
        const refreshed = await refreshAccessToken(account.refresh_token)
        accessToken = refreshed.access_token
        await supabase.from('accounts').update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', account.id)
      }

      const { data: posts } = await supabase
        .from('posts')
        .select('id, tiktok_video_id')
        .eq('account_id', account.id)

      if (!posts || posts.length === 0) continue

      const videoIds = posts.map(p => p.tiktok_video_id)
      const BATCH_SIZE = 20

      for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
        const batch = videoIds.slice(i, i + BATCH_SIZE)
        const videos = await getVideoMetrics(accessToken, batch)

        const metricsToUpsert = videos.map(video => {
          const post = posts.find(p => p.tiktok_video_id === video.id)!
          return {
            post_id: post.id,
            recorded_at: today,
            views: video.view_count,
            likes: video.like_count,
            comments: video.comment_count,
            shares: video.share_count,
          }
        })

        if (metricsToUpsert.length > 0) {
          await supabase
            .from('post_metrics')
            .upsert(metricsToUpsert, { onConflict: 'post_id,recorded_at' })
        }
      }

      processed++
    } catch (err) {
      errors.push(`account ${account.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ ok: true, processed, errors })
}
