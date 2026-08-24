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

export async function linkItemAiTool(itemId: string, aiToolIdOrName: string, isNew: boolean) {
  if (!aiToolIdOrName?.trim()) return
  const supabase = await createClient()

  let aiToolId = aiToolIdOrName
  if (isNew) {
    const name = aiToolIdOrName.trim()
    const { data: existing } = await supabase.from('ai_tools').select('id').eq('name', name).maybeSingle()
    if (existing) {
      aiToolId = existing.id
    } else {
      const { data: created } = await supabase.from('ai_tools').insert({ name }).select('id').single()
      if (!created) return
      aiToolId = created.id
    }
  }

  await supabase.from('item_ai_tools').insert({ item_id: itemId, ai_tool_id: aiToolId })
  revalidatePath(`/items/${itemId}`)
}

export async function unlinkItemAiTool(itemId: string, linkId: string) {
  const supabase = await createClient()
  await supabase.from('item_ai_tools').delete().eq('id', linkId)
  revalidatePath(`/items/${itemId}`)
}
