import { useEffect } from 'react'

interface ShortcutMap {
  [key: string]: (e: KeyboardEvent) => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/** Registers single-key shortcuts (no modifiers) that are ignored while the user is typing in a field. */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return

      const handler = shortcuts[e.key.toLowerCase()]
      if (handler) {
        e.preventDefault()
        handler(e)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, shortcuts])
}
