export const ROLE_OPTIONS = [
  { value: 'cast', label: 'キャスト' },
  { value: 'editor', label: '編集者' },
  { value: 'operator', label: '運用者' },
  { value: 'broker', label: '仲介者' },
  { value: 'shooter', label: '撮影者' },
  { value: 'reviewer', label: 'レビュアー' },
  { value: 'other', label: 'その他' },
] as const

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map(r => [r.value, r.label])
)
