import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { competitor_id, transcript } = await req.json()

  await supabase.from('competitors')
    .update({ transcript, updated_at: new Date().toISOString() })
    .eq('id', competitor_id)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
