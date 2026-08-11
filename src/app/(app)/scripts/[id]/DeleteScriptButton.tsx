'use client'

export function DeleteScriptButton() {
  return (
    <button
      type="submit"
      className="px-4 py-2 text-red-500 hover:text-red-700 text-sm"
      onClick={e => !confirm('この台本を削除しますか？') && e.preventDefault()}
    >
      削除
    </button>
  )
}
