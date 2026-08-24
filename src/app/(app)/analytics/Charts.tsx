'use client'

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface TrendPoint {
  date: string
  views: number
  likes: number
  new_followers: number
}

interface VideoRank {
  video_title: string | null
  views: number
  likes: number
  engagement: string
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return <EmptyState />

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={n => n >= 10000 ? `${(n/10000).toFixed(0)}万` : String(n)} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [Number(v).toLocaleString()]}
          labelFormatter={l => `インポート日: ${l}`}
          contentStyle={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, color: '#fff' }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend iconType="circle" iconSize={8} />
        <Line type="monotone" dataKey="views" name="再生数" stroke="#e5e5e5" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="likes" name="いいね" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="new_followers" name="フォロワー増" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function RankingChart({ data }: { data: VideoRank[] }) {
  if (!data.length) return <EmptyState />

  const shortened = data.map(d => ({
    ...d,
    label: (d.video_title ?? '不明').slice(0, 16) + ((d.video_title?.length ?? 0) > 16 ? '…' : ''),
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, shortened.length * 36)}>
      <BarChart data={shortened} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={n => n >= 10000 ? `${(n/10000).toFixed(0)}万` : String(n)} />
        <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [Number(v).toLocaleString(), '再生数']}
          contentStyle={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, color: '#fff' }}
          labelStyle={{ color: '#fff' }}
        />
        <Bar dataKey="views" name="再生数" fill="#e5e5e5" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-40 text-neutral-500 text-sm">
      データがありません
    </div>
  )
}
