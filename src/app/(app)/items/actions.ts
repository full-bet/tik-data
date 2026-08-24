'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createItem() {
  const supabase = await createClient()

  const { data } = await supabase.from('items').insert({
    video_title: '新規アイテム',
  }).select().single()

  if (data) redirect(`/items/${data.id}`)
}

export async function updateItemField(
  id: string,
  field: string,
  value: string | number | null
) {
  const supabase = await createClient()
  await supabase.from('items')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/items')
  revalidatePath(`/items/${id}`)
}

export async function deleteItem(id: string) {
  const supabase = await createClient()
  await supabase.from('items').delete().eq('id', id)
  revalidatePath('/items')
  redirect('/items')
}

export async function linkItemMaterial(itemId: string, materialId: string) {
  if (!materialId) return
  const supabase = await createClient()
  await supabase.from('item_materials').insert({ item_id: itemId, material_id: materialId })
  revalidatePath(`/items/${itemId}`)
}

export async function unlinkItemMaterial(itemId: string, linkId: string) {
  const supabase = await createClient()
  await supabase.from('item_materials').delete().eq('id', linkId)
  revalidatePath(`/items/${itemId}`)
}
