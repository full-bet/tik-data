import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForToken, getUserInfo } from '@/lib/tiktok/api'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (!code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=no_code`)
  }

  try {
    const supabase = await createClient()

    const tokenData = await exchangeCodeForToken(code)
    const userInfo = await getUserInfo(tokenData.access_token)

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

    await supabase.from('accounts').upsert({
      tiktok_open_id: userInfo.open_id,
      tiktok_username: userInfo.username,
      tiktok_display_name: userInfo.display_name,
      tiktok_avatar_url: userInfo.avatar_url,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'tiktok_open_id' })

    return NextResponse.redirect(`${appUrl}/accounts?success=connected`)
  } catch (error) {
    console.error('TikTok OAuth error:', error)
    return NextResponse.redirect(`${appUrl}/accounts?error=oauth_failed`)
  }
}
