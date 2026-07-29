import { useEffect, useRef } from 'react'
import type { NavSection } from '../types/profile'
import { buildStepsFor } from '../lib/buildSteps'

type Props = {
  section: NavSection
  onSelect: (section: NavSection) => void
  hasActiveApp?: boolean
}

export function BuildStepTabs({
  section,
  onSelect,
  hasActiveApp = false,
}: Props) {
  const steps = buildStepsFor(hasActiveApp)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    )
    if (!active) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    active.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: reduce ? 'auto' : 'smooth',
    })
  }, [section, hasActiveApp])

  return (
    <div className="no-print -mx-1 overflow-x-auto">
      <ul ref={listRef} className="flex min-w-min gap-1 px-1 pb-1">
        {steps.map((step) => {
          const active = section === step.id
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-current={active ? 'page' : undefined}
                className={`min-h-11 whitespace-nowrap rounded-full border px-3.5 text-xs font-medium touch-manipulation transition ${
                  active
                    ? 'border-amber-600/60 bg-amber-950/50 text-amber-100'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                {step.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
