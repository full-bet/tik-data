import { buildOAuthUrl } from '@/lib/tiktok/api'
import { NextResponse } from 'next/server'

export async function GET() {
  const state = crypto.randomUUID()
  const url = buildOAuthUrl(state)

  const response = NextResponse.redirect(url)
  response.cookies.set('tiktok_oauth_state', state, { httpOnly: true, maxAge: 600 })
  return response
}
