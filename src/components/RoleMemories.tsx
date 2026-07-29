import { useState } from 'react'
import { MEMORY_PROMPTS, suggestBulletsFromMemory } from '../lib/memoryPrompts'
import { CtaButton } from './CtaButton'

type Props = {
  /** Append memory lines as bullets on the job */
  onAddBullets: (bullets: string[]) => void
  defaultOpen?: boolean
}

/**
 * Friendly memory capture for a role — prompts + free write → bullets.
 * Offline; never invents content beyond what the operator types.
 */
export function RoleMemories({ onAddBullets, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [promptIdx, setPromptIdx] = useState(0)
  const [text, setText] = useState('')
  const [flash, setFlash] = useState<string | null>(null)

  const prompt = MEMORY_PROMPTS[promptIdx % MEMORY_PROMPTS.length]

  const apply = () => {
    const lines = suggestBulletsFromMemory(text)
    if (lines.length === 0) {
      setFlash('Write at least one line first')
      window.setTimeout(() => setFlash(null), 1400)
      return
    }
    onAddBullets(lines)
    setText('')
    setFlash(`Added ${lines.length} bullet${lines.length === 1 ? '' : 's'}`)
    window.setTimeout(() => setFlash(null), 1600)
  }

  return (
    <div className="rounded-xl border border-amber-900/40 bg-amber-950/15">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left touch-manipulation"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-100">Role memories</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Talk it out → turn into bullets · {open ? 'hide' : 'tap to open'}
          </p>
        </div>
        <span className="shrink-0 text-xs text-amber-400/90" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-amber-900/30 px-3 pb-3 pt-2">
          <p className="text-xs text-slate-400">
            Answer in plain language (one idea per line). We paste your words as
            draft bullets — then you tighten with Structure & length.
          </p>

          <div className="flex flex-wrap gap-1.5">
            {MEMORY_PROMPTS.map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => setPromptIdx(i)}
                className={`rounded-full border px-2.5 py-1 text-[11px] touch-manipulation ${
                  i === promptIdx % MEMORY_PROMPTS.length
                    ? 'border-amber-600/50 bg-amber-950/40 text-amber-100'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {shortPrompt(p)}
              </button>
            ))}
          </div>

          <p className="text-sm font-medium text-slate-200">{prompt}</p>

          <textarea
            className="rf-input min-h-[120px] resize-y"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              'Example:\nRan Bill of Materials checks on Line 2\nTrained two new hires on LOTO\nCovered weekend shift when short-staffed'
            }
          />

          <CtaButton
            variant="primary"
            className="min-h-11 w-full"
            onClick={apply}
            disabled={!text.trim()}
          >
            {flash ?? 'Add as bullets on this role'}
          </CtaButton>
        </div>
      )}
    </div>
  )
}

function shortPrompt(p: string): string {
  if (p.includes('typical day')) return 'Typical day'
  if (p.includes('safety')) return 'Numbers'
  if (p.includes('Machines')) return 'Tools'
  if (p.includes('trained')) return 'People'
  if (p.includes('Problems')) return 'Problems fixed'
  if (p.includes('proud')) return 'Proud of'
  return p.slice(0, 18)
}
