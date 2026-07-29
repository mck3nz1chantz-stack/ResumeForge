import { useEffect, useRef, useState } from 'react'
import { CtaButton } from './CtaButton'

type Props = {
  label: string
  hint?: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  /** Optional quick-add chips (e.g. pack tools) */
  suggestions?: string[]
}

/**
 * Multi-word tag entry (spaces allowed).
 * Commits on Add, Enter, or comma — does NOT re-parse the whole string on every keystroke
 * (that bug stripped spaces from phrases like "Bill of Materials").
 * Tap an existing tag to edit in place.
 */
export function TagInput({
  label,
  hint,
  tags,
  onChange,
  placeholder = 'Type a tool or method…',
  suggestions = [],
}: Props) {
  const [draft, setDraft] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addRaw = (raw: string) => {
    // Allow comma-separated batch paste
    const parts = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = [...tags]
    for (const p of parts) {
      if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) {
        next.push(p)
      }
    }
    onChange(next)
    setDraft('')
  }

  const remove = (index: number) => {
    if (editingIndex === index) setEditingIndex(null)
    else if (editingIndex != null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
    onChange(tags.filter((_, i) => i !== index))
  }

  /** @returns true if closed; false if duplicate blocked */
  const update = (index: number, raw: string): boolean => {
    const t = raw.trim()
    if (!t) {
      remove(index)
      setEditingIndex(null)
      return true
    }
    const prev = (tags[index] ?? '').trim()
    if (t.toLowerCase() === prev.toLowerCase()) {
      if (t !== tags[index]) {
        onChange(tags.map((x, i) => (i === index ? t : x)))
      }
      setEditingIndex(null)
      return true
    }
    if (tags.some((x, i) => i !== index && x.toLowerCase() === t.toLowerCase())) {
      return false
    }
    onChange(tags.map((x, i) => (i === index ? t : x)))
    setEditingIndex(null)
    return true
  }

  const available = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()),
  )

  return (
    <div className="space-y-2">
      <div>
        <span className="rf-label">{label}</span>
        {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
        {tags.length > 0 && (
          <p className="mt-0.5 text-[11px] text-slate-500">
            Tap a tag to edit · × to remove
          </p>
        )}
      </div>

      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) =>
            editingIndex === i ? (
              <li key={`edit-${i}`} className="w-full min-w-0 basis-full">
                <InlineTagEditor
                  initial={tag}
                  ariaLabel={`Edit ${label} item`}
                  onSave={(next) => update(i, next)}
                  onCancel={() => setEditingIndex(null)}
                />
              </li>
            ) : (
              <li
                key={`${tag}-${i}`}
                className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-slate-600 bg-slate-800/90 py-1 pl-1 pr-1 text-xs text-slate-100"
              >
                <button
                  type="button"
                  className="min-h-8 max-w-[14rem] truncate rounded-full px-2 text-left hover:bg-slate-700/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500/60"
                  onClick={() => setEditingIndex(i)}
                  title="Edit"
                  aria-label={`Edit ${tag}`}
                >
                  {tag}
                </button>
                <button
                  type="button"
                  className="min-h-8 min-w-8 rounded-full text-slate-400 hover:bg-red-950/40 hover:text-red-200"
                  aria-label={`Remove ${tag}`}
                  onClick={() => remove(i)}
                >
                  ×
                </button>
              </li>
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
              addRaw(draft)
              return
            }
            if (e.key === ',' && draft.trim()) {
              e.preventDefault()
              addRaw(draft)
              return
            }
            if (e.key === 'Backspace' && !draft && tags.length > 0) {
              remove(tags.length - 1)
            }
          }}
          placeholder={placeholder}
          aria-label={label}
        />
        <CtaButton
          variant="primary"
          className="min-h-11 shrink-0 sm:min-w-[5.5rem]"
          onClick={() => addRaw(draft)}
          disabled={!draft.trim()}
        >
          Add
        </CtaButton>
      </div>
      <p className="text-[10px] text-slate-500">
        Spaces OK (e.g. Bill of Materials). Press Enter or Add. Comma starts a
        new item.
      </p>

      {available.length > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Quick add
          </p>
          <div className="flex flex-wrap gap-1.5">
            {available.slice(0, 12).map((s) => (
              <button
                key={s}
                type="button"
                className="rf-clickable rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:border-amber-600/50 hover:text-amber-200"
                onClick={() => addRaw(s)}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InlineTagEditor({
  initial,
  ariaLabel,
  onSave,
  onCancel,
}: {
  initial: string
  ariaLabel: string
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
    if (!onSave(value)) setDupHint(true)
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
          Already on the list — change the wording or cancel.
        </p>
      )}
      <p className="text-[10px] text-slate-500">Enter to save · Esc to cancel</p>
    </div>
  )
}
