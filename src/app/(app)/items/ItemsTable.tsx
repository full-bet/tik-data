'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { updateItemField } from './actions'

type Item = {
  id: string
  video_title: string
  video_url: string | null
  category: string | null
  posted_at: string | null
  initial_views: number | null
  initial_likes: number | null
  initial_followers_gained: number | null
  initial_cv_count: number | null
  views: number | null
  likes: number | null
  followers_gained: number | null
  cv_count: number | null
}

type EditingCell = { id: string; field: string } | null

function fmt(n: number | null) {
  if (n === null || n === 0) return '—'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return n.toLocaleString()
}

function EditableNumberCell({
  item,
  field,
  value,
  editing,
  onStartEdit,
  onSave,
}: {
  item: Item
  field: string
  value: number | null
  editing: boolean
  onStartEdit: () => void
  onSave: (val: number | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFocus() {
    onStartEdit()
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value === '' ? null : Number(e.target.value)
    onSave(val)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      const val = (e.target as HTMLInputElement).value === '' ? null : Number((e.target as HTMLInputElement).value)
      onSave(val)
    }
    if (e.key === 'Escape') onSave(value)
  }

  return (
    <td
      className="px-3 py-0 text-right group"
      onClick={onStartEdit}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          defaultValue={value ?? ''}
          autoFocus
          onFocus={e => e.target.select()}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-right bg-neutral-500/10 border border-neutral-500/60 rounded px-1 py-1.5 text-sm text-white focus:outline-none"
        />
      ) : (
        <span className="block py-1.5 px-1 text-sm text-neutral-300 cursor-pointer group-hover:bg-white/5 rounded">
          {fmt(value)}
        </span>
      )}
    </td>
  )
}

export default function ItemsTable({ items: initialItems }: { items: Item[] }) {
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const [, startTransition] = useTransition()

  function handleSave(id: string, field: string, value: number | null) {
    setEditingCell(null)
    startTransition(() => updateItemField(id, field, value))
  }

  const numericFields: { field: keyof Item; label: string; group: 'initial' | 'total' }[] = [
    { field: 'initial_views',            label: '再生',     group: 'initial' },
    { field: 'initial_likes',            label: 'いいね',   group: 'initial' },
    { field: 'initial_followers_gained', label: 'フォロワー', group: 'initial' },
    { field: 'initial_cv_count',         label: 'CV',       group: 'initial' },
    { field: 'views',                    label: '再生',     group: 'total'   },
    { field: 'likes',                    label: 'いいね',   group: 'total'   },
    { field: 'followers_gained',         label: 'フォロワー', group: 'total'   },
    { field: 'cv_count',                 label: 'CV',       group: 'total'   },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-sm border-collapse">
        <thead>
          <tr className="bg-neutral-800 border-y border-neutral-800">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 whitespace-nowrap w-56 sticky left-0 bg-neutral-800 z-10">
              動画タイトル
            </th>
            <th className="text-left px-3 py-2.5 text-xs font-semibold text-neutral-500 whitespace-nowrap w-24">カテゴリ</th>
            <th className="text-left px-3 py-2.5 text-xs font-semibold text-neutral-500 whitespace-nowrap w-24">投稿日</th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-neutral-300 whitespace-nowrap w-20" colSpan={4}>
              初動 72h ▼
            </th>
            <th className="w-px bg-neutral-600" />
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-neutral-500 whitespace-nowrap w-20" colSpan={4}>
              累計 ▼
            </th>
            <th className="w-8" />
          </tr>
          <tr className="bg-black border-b border-neutral-800">
            <th className="sticky left-0 bg-black z-10" />
            <th />
            <th />
            {numericFields.map(({ field, label, group }) => (
              <th
                key={field}
                className={`text-right px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                  group === 'initial' ? 'text-neutral-300' : 'text-neutral-500'
                }`}
              >
                {label}
              </th>
            ))}
            <th className="w-px" />
            <th />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {initialItems.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center py-16 text-neutral-500 text-sm whitespace-nowrap">
                アイテムがありません。「+ 追加」から作成してください
              </td>
            </tr>
          ) : (
            initialItems.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group/row">
                {/* タイトル */}
                <td className="px-4 py-0 sticky left-0 bg-neutral-900 group-hover/row:bg-black z-10 transition-colors">
                  <Link
                    href={`/items/${item.id}`}
                    className="block py-2 font-medium text-neutral-300 hover:underline truncate max-w-[220px]"
                  >
                    {item.video_title}
                  </Link>
                </td>
                {/* カテゴリ */}
                <td className="px-3 py-0">
                  <span className="block py-2 text-neutral-500 text-xs truncate">
                    {item.category ?? '—'}
                  </span>
                </td>
                {/* 投稿日 */}
                <td className="px-3 py-0">
                  <span className="block py-2 text-neutral-500 text-xs">
                    {item.posted_at
                      ? new Date(item.posted_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
                      : '—'}
                  </span>
                </td>
                {/* 指標セル */}
                {numericFields.map(({ field, group }) => (
                  <EditableNumberCell
                    key={field}
                    item={item}
                    field={field}
                    value={item[field] as number | null}
                    editing={editingCell?.id === item.id && editingCell?.field === field}
                    onStartEdit={() => setEditingCell({ id: item.id, field })}
                    onSave={val => handleSave(item.id, field, val)}
                  />
                ))}
                <td className="w-px bg-neutral-800" />
                {/* 詳細リンク */}
                <td className="px-2">
                  <Link
                    href={`/items/${item.id}`}
                    className="opacity-0 group-hover/row:opacity-100 text-neutral-400 hover:text-white text-xs transition-opacity"
                  >
                    →
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
