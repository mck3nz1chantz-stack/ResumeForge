import { useEffect, useRef, useState } from 'react'
import { CtaButton } from './CtaButton'
import { usePressFlash } from '../hooks/usePressFlash'

type Props = {
  label: string
  hint?: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  suggestions?: string[]
}

/**
 * Itemized skill inputs for one category (add / edit / remove chips).
 */
export function SkillChipList({
  label,
  hint,
  items,
  onChange,
  placeholder = 'Add a skill…',
  suggestions = [],
}: Props) {
  const [draft, setDraft] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const add = (raw: string) => {
    const t = raw.trim()
    if (!t) return
    if (items.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...items, t])
    setDraft('')
  }

  const remove = (index: number) => {
    if (editingIndex === index) setEditingIndex(null)
    else if (editingIndex != null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
    onChange(items.filter((_, i) => i !== index))
  }

  /** @returns true if closed (saved or emptied); false if duplicate blocked */
  const update = (index: number, raw: string): boolean => {
    const t = raw.trim()
    if (!t) {
      remove(index)
      setEditingIndex(null)
      return true
    }
    const unchanged =
      t.toLowerCase() === (items[index] ?? '').trim().toLowerCase()
    if (unchanged) {
      // Normalize whitespace only
      if (t !== items[index]) {
        onChange(items.map((x, i) => (i === index ? t : x)))
      }
      setEditingIndex(null)
      return true
    }
    const dup = items.some(
      (x, i) => i !== index && x.toLowerCase() === t.toLowerCase(),
    )
    if (dup) return false
    onChange(items.map((x, i) => (i === index ? t : x)))
    setEditingIndex(null)
    return true
  }

  const availableSuggestions = suggestions.filter(
    (s) => !items.some((x) => x.toLowerCase() === s.toLowerCase()),
  )

  return (
    <section className="rf-card space-y-3">
      <header>
        <h3 className="text-sm font-semibold text-slate-100">{label}</h3>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
        {items.length > 0 && (
          <p className="mt-1 text-[11px] text-slate-500">
            Tap a skill to edit · × to remove
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-700 px-3 py-3 text-center text-xs text-slate-500">
          No items yet — type below and tap Add
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {items.map((item, i) =>
            editingIndex === i ? (
              <li
                key={`edit-${i}`}
                className="w-full min-w-0 sm:w-auto sm:min-w-[12rem] sm:max-w-full"
              >
                <InlineChipEditor
                  initial={item}
                  ariaLabel={`Edit ${label} item`}
                  onSave={(next) => update(i, next)}
                  onCancel={() => setEditingIndex(null)}
                />
              </li>
            ) : (
              <SkillChip
                key={`${item}-${i}`}
                label={item}
                onEdit={() => setEditingIndex(i)}
                onRemove={() => remove(i)}
              />
            ),
          )}
        </ul>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="rf-input min-h-11 flex-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(draft)
            }
          }}
          placeholder={placeholder}
          aria-label={`Add ${label}`}
        />
        <CtaButton
          variant="primary"
          className="min-h-11 shrink-0 sm:min-w-[5.5rem]"
          onClick={() => add(draft)}
          disabled={!draft.trim()}
        >
          Add
        </CtaButton>
      </div>

      {availableSuggestions.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Quick add
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availableSuggestions.slice(0, 10).map((s) => (
              <button
                key={s}
                type="button"
                className="rf-clickable rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:border-amber-600/50 hover:text-amber-200"
                onClick={() => add(s)}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function SkillChip({
  label,
  onEdit,
  onRemove,
}: {
  label: string
  onEdit: () => void
  onRemove: () => void
}) {
  const { stateClass, pressProps } = usePressFlash(200)
  return (
    <li
      className={`inline-flex max-w-full items-center gap-0.5 rounded-full border border-slate-600 bg-slate-800/90 py-1 pl-1 pr-1 text-sm text-slate-100 ${stateClass}`}
    >
      <button
        type="button"
        className="min-h-8 max-w-[14rem] truncate rounded-full px-2.5 text-left text-sm text-slate-100 hover:bg-slate-700/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500/60"
        onClick={onEdit}
        title="Edit"
        aria-label={`Edit ${label}`}
      >
        {label}
      </button>
      <button
        type="button"
        className="rf-btn min-h-8 min-w-8 rounded-full border-slate-600 px-0 text-xs text-slate-300 hover:border-red-600/60 hover:bg-red-950/50 hover:text-red-200"
        aria-label={`Remove ${label}`}
        onPointerDown={pressProps.onPointerDown}
        onPointerUp={pressProps.onPointerUp}
        onPointerCancel={pressProps.onPointerCancel}
        onPointerLeave={pressProps.onPointerLeave}
        onClick={() => {
          pressProps.onClick()
          onRemove()
        }}
      >
        ×
      </button>
    </li>
  )
}

function InlineChipEditor({
  initial,
  ariaLabel,
  onSave,
  onCancel,
}: {
  initial: string
  ariaLabel: string
  /** return false to keep editor open (e.g. duplicate) */
  onSave: (next: string) => boolean
  onCancel: () => void
}) {
  const [value, setValue] = useState(initial)
  const [dupHint, setDupHint] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const commit = () => {
    const ok = onSave(value)
    if (!ok) setDupHint(true)
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          className="rf-input min-h-11 flex-1"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setDupHint(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              onCancel()
            }
          }}
          aria-label={ariaLabel}
        />
        <div className="flex gap-2">
          <CtaButton
            variant="primary"
            className="min-h-11 flex-1 sm:min-w-[4.5rem]"
            onClick={commit}
          >
            Save
          </CtaButton>
          <CtaButton
            className="min-h-11 flex-1 sm:min-w-[4.5rem]"
            onClick={onCancel}
          >
            Cancel
          </CtaButton>
        </div>
      </div>
      {dupHint && (
        <p className="text-[11px] text-amber-300/90">
          That skill is already on the list — change the wording or cancel.
        </p>
      )}
      <p className="text-[10px] text-slate-500">Enter to save · Esc to cancel</p>
    </div>
  )
}
