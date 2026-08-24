'use client'

export function DeleteArticleButton() {
  return (
    <button
      type="submit"
      className="px-4 py-2 text-red-500 hover:text-red-400 text-sm"
      onClick={e => !confirm('このナレッジを削除しますか？') && e.preventDefault()}
    >
      削除
    </button>
  )
}
