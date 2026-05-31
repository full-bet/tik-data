'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateCompetitorField(id: string, field: string, value: string | null) {
  const supabase = await createClient()
  await supabase.from('competitors')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath(`/competitors/${id}`)
}

export async function deleteCompetitor(id: string) {
  const supabase = await createClient()
  await supabase.from('competitors').delete().eq('id', id)
  redirect('/competitors')
}
