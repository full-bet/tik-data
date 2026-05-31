'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCompetitorVideo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const tiktokUrl = formData.get('tiktok_url') as string
  if (!tiktokUrl) return

  const { data } = await supabase.from('competitor_videos').insert({
    user_id: user.id,
    tiktok_url: tiktokUrl,
    title: (formData.get('title') as string) || null,
    account_name: (formData.get('account_name') as string) || null,
    category: (formData.get('category') as string) || null,
  }).select().single()

  if (data) redirect(`/competitor/${data.id}`)
}

export async function updateCompetitorField(
  id: string,
  field: string,
  value: string | null
) {
  const supabase = await createClient()
  await supabase.from('competitor_videos')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/competitor')
  revalidatePath(`/competitor/${id}`)
}

export async function deleteCompetitorVideo(id: string) {
  const supabase = await createClient()
  await supabase.from('competitor_videos').delete().eq('id', id)
  revalidatePath('/competitor')
  redirect('/competitor')
}
