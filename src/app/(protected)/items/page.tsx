import { createClient } from '@/lib/supabase/server'
import { createItem } from './actions'
import ItemsTable from './ItemsTable'

export default async function ItemsPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('items')
    .select('id,video_title,video_url,category,posted_at,initial_views,initial_likes,initial_followers_gained,initial_cv_count,views,likes,followers_gained,cv_count')
    .order('posted_at', { ascending: false, nullsFirst: false })

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">投稿管理</h1>
          <p className="text-slate-500 text-sm mt-1">{items?.length ?? 0}件</p>
        </div>
        <form action={createItem}>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + 追加
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <ItemsTable items={items ?? []} />
      </div>
    </div>
  )
}
