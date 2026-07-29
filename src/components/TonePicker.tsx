import type { ResumeToneId } from '../data/tones'
import { RESUME_TONES, getTone } from '../data/tones'

type Props = {
  value: ResumeToneId | string
  onChange: (toneId: ResumeToneId) => void
  compact?: boolean
}

export function TonePicker({ value, onChange, compact }: Props) {
  const active = getTone(value)

  return (
    <div className="space-y-2">
      {!compact && (
        <div>
          <span className="rf-label">Style / tone for this target</span>
          <p className="mb-2 text-xs text-slate-500">
            Sets layout + writing guidance for what you’re applying for. Content
            stays yours — never invents metrics.
          </p>
        </div>
      )}
      <div
        className={`grid gap-2 ${
          compact ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {RESUME_TONES.map((t) => {
          const selected = t.id === active.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`rounded-xl border px-2.5 py-2 text-left transition touch-manipulation ${
                selected
                  ? 'border-amber-700/50 bg-amber-950/30 ring-1 ring-amber-700/40'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <p className="text-xs font-semibold text-slate-100">{t.short}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                {t.bestFor}
              </p>
            </button>
          )
        })}
      </div>
      {!compact && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2.5 text-xs text-slate-400">
          <p className="font-medium text-slate-200">{active.label}</p>
          <p className="mt-1">{active.description}</p>
          <p className="mt-1 text-slate-500">
            Voice: {active.voice} · 3-C: {active.threeCFocus}
          </p>
        </div>
      )}
    </div>
  )
}
