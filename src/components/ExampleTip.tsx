import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { CtaButton } from './CtaButton'

type Props = {
  /** Button / trigger label */
  label?: string
  title: string
  children: ReactNode
  className?: string
}

type PanelPos =
  | { mode: 'sheet' }
  | {
      mode: 'fixed'
      top?: number
      bottom?: number
      left: number
      width: number
      maxHeight: number
    }

const GAP = 8
const PAD = 10
/** Above live sheet (z-40) and bottom nav (z-30) */
const TIP_Z = 50
const DESKTOP_W = 416 // ~26rem
const PREFERRED_MAX_H = 384 // 24rem

function isHoverDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  )
}

function isNarrow(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 639px)').matches
  )
}

function computePos(trigger: DOMRect): PanelPos {
  if (isNarrow()) return { mode: 'sheet' }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(DESKTOP_W, vw - PAD * 2)

  let left = trigger.right - width
  left = Math.max(PAD, Math.min(left, vw - PAD - width))

  const spaceBelow = vh - trigger.bottom - GAP - PAD
  const spaceAbove = trigger.top - GAP - PAD
  const placeBelow = spaceBelow >= 180 || spaceBelow >= spaceAbove

  if (placeBelow) {
    return {
      mode: 'fixed',
      top: trigger.bottom + GAP,
      left,
      width,
      maxHeight: Math.min(PREFERRED_MAX_H, Math.max(120, spaceBelow)),
    }
  }
  return {
    mode: 'fixed',
    bottom: vh - trigger.top + GAP,
    left,
    width,
    maxHeight: Math.min(PREFERRED_MAX_H, Math.max(120, spaceAbove)),
  }
}

/**
 * Hover (desktop) + tap (mobile) example popover.
 * Portals to document.body; focus-trapped; mobile bottom sheet with scroll lock.
 */
export function ExampleTip({
  label = 'Examples',
  title,
  children,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<PanelPos | null>(null)
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const hoverCloseTimer = useRef<number | null>(null)

  const clearHoverTimer = () => {
    if (hoverCloseTimer.current != null) {
      window.clearTimeout(hoverCloseTimer.current)
      hoverCloseTimer.current = null
    }
  }

  const scheduleHoverClose = () => {
    clearHoverTimer()
    hoverCloseTimer.current = window.setTimeout(() => setOpen(false), 160)
  }

  const updatePos = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    setPos(computePos(el.getBoundingClientRect()))
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    updatePos()
  }, [open, updatePos])

  useEffect(() => {
    if (!open) return
    const onReposition = () => updatePos()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open, updatePos])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const tid = window.setTimeout(() => {
      document.addEventListener('mousedown', onDoc)
      document.addEventListener('touchstart', onDoc)
    }, 0)
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(tid)
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => () => clearHoverTimer(), [])

  // Focus trap + scroll lock (sheet and fixed popover)
  useDialogFocus(open && Boolean(pos), panelRef, {
    returnFocusRef: triggerRef,
    lockScroll: pos?.mode === 'sheet',
    initialFocusSelector: '[data-rf-tip-close]',
  })

  const panel =
    open &&
    pos &&
    typeof document !== 'undefined' &&
    createPortal(
      pos.mode === 'sheet' ? (
        <div
          className="fixed inset-0 flex flex-col justify-end"
          style={{ zIndex: TIP_Z }}
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
            aria-label="Close examples"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="relative mx-auto flex max-h-[min(78dvh,36rem)] w-full max-w-lg flex-col rounded-t-2xl border border-amber-800/40 bg-slate-950 p-3 shadow-2xl shadow-black/60 outline-none"
            style={{
              paddingBottom:
                'max(0.75rem, env(safe-area-inset-bottom, 0px))',
            }}
            onMouseEnter={() => {
              if (isHoverDevice()) clearHoverTimer()
            }}
            onMouseLeave={() => {
              if (isHoverDevice()) scheduleHoverClose()
            }}
          >
            <div
              className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-slate-700"
              aria-hidden
            />
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-amber-100">{title}</p>
              <CtaButton
                className="min-h-10 px-2 text-xs"
                data-rf-tip-close
                onClick={() => setOpen(false)}
              >
                Close
              </CtaButton>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain text-sm text-slate-300">
              {children}
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={panelRef}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className="fixed rounded-xl border border-amber-800/40 bg-slate-950 p-3 shadow-xl shadow-black/50 outline-none"
          style={{
            zIndex: TIP_Z,
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            width: pos.width,
            maxHeight: pos.maxHeight,
            display: 'flex',
            flexDirection: 'column',
          }}
          onMouseEnter={() => {
            if (isHoverDevice()) clearHoverTimer()
          }}
          onMouseLeave={() => {
            if (isHoverDevice()) scheduleHoverClose()
          }}
        >
          <div className="mb-2 flex shrink-0 items-start justify-between gap-2">
            <p className="text-sm font-semibold text-amber-100">{title}</p>
            <CtaButton
              className="min-h-10 px-2 text-xs"
              data-rf-tip-close
              onClick={() => setOpen(false)}
            >
              Close
            </CtaButton>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain text-sm text-slate-300">
            {children}
          </div>
        </div>
      ),
      document.body,
    )

  return (
    <div className={`inline-flex ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className="rf-btn min-h-10 gap-1.5 border-amber-800/50 bg-amber-950/40 text-xs text-amber-100 hover:border-amber-600 hover:bg-amber-900/50"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => {
          if (isHoverDevice()) {
            clearHoverTimer()
            setOpen(true)
          }
        }}
        onMouseLeave={() => {
          if (isHoverDevice()) scheduleHoverClose()
        }}
      >
        <span aria-hidden className="text-amber-400">
          ?
        </span>
        {label}
      </button>
      {panel}
    </div>
  )
}
