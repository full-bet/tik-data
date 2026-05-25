import { createClient } from '@/lib/supabase/server'
import { buildOAuthUrl } from '@/lib/tiktok/api'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))

  const state = crypto.randomUUID()
  const url = buildOAuthUrl(state)

  const response = NextResponse.redirect(url)
  response.cookies.set('tiktok_oauth_state', state, { httpOnly: true, maxAge: 600 })
  return response
}
