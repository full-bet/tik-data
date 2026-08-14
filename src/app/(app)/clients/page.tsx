import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('id,name,contact_name,notes,created_at')
    .order('created_at', { ascending: false })

  const clientIds = (clients ?? []).map(c => c.id)

  type MethodLink = { client_id: string; contact_methods: { name: string } | null }
  const { data: methodLinksRaw } = clientIds.length
    ? await supabase.from('client_contact_methods').select('client_id,contact_methods(name)').in('client_id', clientIds)
    : { data: [] }
  const methodLinks = (methodLinksRaw ?? []) as unknown as MethodLink[]

  const methodsByClient = new Map<string, string[]>()
  for (const link of methodLinks) {
    const name = link.contact_methods?.name
    if (!name) continue
    methodsByClient.set(link.client_id, [...(methodsByClient.get(link.client_id) ?? []), name])
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">取引先</h1>
          <p className="text-neutral-500 text-sm mt-1">{clients?.length ?? 0}件</p>
        </div>
        <Link
          href="/clients/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </Link>
      </div>

      {!clients || clients.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-16 text-center">
          <p className="text-4xl mb-4">🏢</p>
          <p className="text-neutral-400 font-medium">取引先がまだ登録されていません</p>
          <Link
            href="/clients/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            最初の取引先を追加
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map(c => (
            <div key={c.id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-white">{c.name}</p>
                <div className="flex gap-1.5 flex-wrap justify-end shrink-0">
                  {(methodsByClient.get(c.id) ?? []).map((name, i) => (
                    <span key={i} className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              {c.contact_name && (
                <p className="text-neutral-500 text-sm mt-1">担当者: {c.contact_name}</p>
              )}
              {c.notes && <p className="text-neutral-400 text-sm mt-3">{c.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
