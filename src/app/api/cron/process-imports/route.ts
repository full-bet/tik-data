import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Vercel cron: runs daily to finalize any stuck 'processing' imports
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Reset imports stuck in 'processing' for over 1 hour back to 'pending'
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: stuck } = await supabase
    .from('analytics_imports')
    .select('id')
    .eq('status', 'processing')
    .lt('created_at', oneHourAgo)

  if (stuck?.length) {
    await supabase
      .from('analytics_imports')
      .update({ status: 'error', error_message: 'Processing timeout' })
      .in('id', stuck.map(r => r.id))
  }

  return NextResponse.json({ reset: stuck?.length ?? 0 })
}
