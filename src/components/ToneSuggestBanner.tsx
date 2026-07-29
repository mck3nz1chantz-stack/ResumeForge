import type { ResumeToneId } from '../types/application'
import { getTone } from '../data/tones'
import {
  confidenceLabel,
  type ToneSuggestion,
} from '../lib/suggestTone'
import { CtaButton } from './CtaButton'

type Props = {
  suggestion: ToneSuggestion
  currentTone: ResumeToneId | string
  onAccept: (toneId: ResumeToneId) => void
  onDismiss: () => void
  /** Compact strip for JD extract flash */
  compact?: boolean
}

/**
 * Slice 3 — accept/dismiss tone suggestion (never auto-overwrites).
 */
export function ToneSuggestBanner({
  suggestion,
  currentTone,
  onAccept,
  onDismiss,
  compact,
}: Props) {
  if (!suggestion.differsFromCurrent) return null

  const next = getTone(suggestion.toneId)
  const cur = getTone(currentTone)

  return (
    <div
      className={`rounded-xl border border-amber-800/45 bg-amber-950/25 ${
        compact ? 'p-2.5' : 'p-3'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
            Tone suggestion · {confidenceLabel(suggestion.confidence)}
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-100">
            Switch to <span className="text-amber-100">{next.label}</span>
            <span className="font-normal text-slate-500">
              {' '}
              (now: {cur.short})
            </span>
          </p>
          {!compact && (
            <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-slate-400">
              {suggestion.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          {compact && suggestion.reasons[0] && (
            <p className="mt-1 text-xs text-slate-400">{suggestion.reasons[0]}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          <CtaButton
            variant="primary"
            className="min-h-9 text-xs"
            onClick={() => onAccept(suggestion.toneId)}
          >
            Apply tone
          </CtaButton>
          <CtaButton className="min-h-9 text-xs" onClick={onDismiss}>
            Keep {cur.short}
          </CtaButton>
        </div>
      </div>
      {!compact && (
        <p className="mt-2 text-[11px] text-slate-600">
          Applies layout + writing guidance only. Your content is unchanged.
        </p>
      )}
    </div>
  )
}
