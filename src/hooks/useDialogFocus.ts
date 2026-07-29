import { useEffect, type RefObject } from 'react'

/** Nested body scroll lock (live sheet + tip can stack). */
let bodyLockCount = 0
let prevOverflow = ''

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return
  if (bodyLockCount === 0) {
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  bodyLockCount += 1
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return
  bodyLockCount = Math.max(0, bodyLockCount - 1)
  if (bodyLockCount === 0) {
    document.body.style.overflow = prevOverflow
  }
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Focus trap + optional body scroll lock while a dialog is open.
 * Restores focus to `returnFocusRef` or the previously focused element.
 */
export function useDialogFocus(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options?: {
    returnFocusRef?: RefObject<HTMLElement | null>
    lockScroll?: boolean
    /** Prefer this selector for initial focus (e.g. close button) */
    initialFocusSelector?: string
  },
): void {
  const lockScroll = options?.lockScroll !== false

  useEffect(() => {
    if (!open) return
    const container = containerRef.current
    if (!container) return

    const previouslyFocused =
      (document.activeElement as HTMLElement | null) ?? null
    // Snapshot for cleanup — ref.current may change by unmount time
    const returnFocusEl = options?.returnFocusRef?.current ?? null

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )

    const initial =
      (options?.initialFocusSelector
        ? container.querySelector<HTMLElement>(options.initialFocusSelector)
        : null) ?? getFocusable()[0]
    // Defer so portal content is mounted
    const focusTid = window.setTimeout(() => {
      initial?.focus()
    }, 0)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else if (
        document.activeElement === last ||
        !container.contains(document.activeElement)
      ) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    if (lockScroll) lockBodyScroll()

    return () => {
      window.clearTimeout(focusTid)
      document.removeEventListener('keydown', onKeyDown)
      if (lockScroll) unlockBodyScroll()
      const restore = returnFocusEl ?? previouslyFocused
      if (restore && typeof restore.focus === 'function') {
        try {
          restore.focus()
        } catch {
          /* ignore */
        }
      }
    }
  }, [open, containerRef, lockScroll, options?.returnFocusRef, options?.initialFocusSelector])
}
