import { useCallback, useRef, useState } from 'react'

/**
 * Short visual “this was clicked” flash for CTAs.
 * Returns className to merge + handlers to spread on the button.
 */
export function usePressFlash(ms = 320) {
  const [flash, setFlash] = useState(false)
  const [down, setDown] = useState(false)
  const timer = useRef<number | null>(null)

  const clearTimer = () => {
    if (timer.current != null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  const pulse = useCallback(() => {
    clearTimer()
    setFlash(true)
    timer.current = window.setTimeout(() => {
      setFlash(false)
      timer.current = null
    }, ms)
  }, [ms])

  const pressProps = {
    onPointerDown: () => setDown(true),
    onPointerUp: () => setDown(false),
    onPointerCancel: () => setDown(false),
    onPointerLeave: () => setDown(false),
    onClick: () => pulse(),
  }

  const stateClass = [
    'rf-interactive',
    down ? 'rf-is-down' : '',
    flash ? 'rf-is-flash' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return { stateClass, pressProps, pulse, flash }
}

export type ActionPhase = 'idle' | 'busy' | 'done' | 'error'

/** One-shot label swap after click (e.g. PDF → Done / Failed). */
export function useActionLabel(
  idle: string,
  busy: string,
  done: string,
  options?: { doneMs?: number; errorMs?: number; error?: string },
) {
  const doneMs = options?.doneMs ?? 1400
  const errorMs = options?.errorMs ?? 2000
  const errorLabel = options?.error ?? 'Failed — try again'
  const [phase, setPhase] = useState<ActionPhase>('idle')

  const run = useCallback(
    async (fn: () => void | Promise<void>) => {
      setPhase('busy')
      try {
        await fn()
        setPhase('done')
        window.setTimeout(() => setPhase('idle'), doneMs)
      } catch {
        setPhase('error')
        window.setTimeout(() => setPhase('idle'), errorMs)
      }
    },
    [doneMs, errorMs],
  )

  const label =
    phase === 'busy'
      ? busy
      : phase === 'done'
        ? done
        : phase === 'error'
          ? errorLabel
          : idle

  return { label, phase, run }
}
