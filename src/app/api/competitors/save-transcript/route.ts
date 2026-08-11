import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { competitor_id, transcript } = await req.json()

  await supabase.from('competitors')
    .update({ transcript, updated_at: new Date().toISOString() })
    .eq('id', competitor_id)

  return NextResponse.json({ success: true })
}
