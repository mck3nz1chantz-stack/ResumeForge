import {
  SUMMARY_EXAMPLES,
  SUMMARY_TIPS,
} from '../data/summaryExamples'
import { scaffoldFor } from '../data/expertScaffolds'
import { getPack } from '../data/packs'
import { CtaButton } from './CtaButton'
import { ExampleTip } from './ExampleTip'
import { SectionCoach } from './SectionCoach'
import { SectionGuide } from './SectionGuide'

type Props = {
  summary: string
  onChange: (summary: string) => void
  packId?: string
}

export function SummaryPanel({ summary, onChange, packId }: Props) {
  const pack = getPack(packId)
  const formula = pack.summaryFormula
  const coach = scaffoldFor('summary')

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-50">
            Step 3 · Professional summary
          </h2>
          <p className="text-sm text-slate-400">
            Right under your name on the resume — not buried. Base text for the
            master profile; each build can override under{' '}
            <strong className="font-medium text-slate-300">This build</strong>.
          </p>
          {/* One-line formula — full examples live in the tip only */}
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            <span className="font-medium text-amber-400/90">
              {pack.shortName} formula:
            </span>{' '}
            {formula}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SectionGuide guideId="summary" />
          <ExampleTip label="Examples" title="Professional summary examples">
            <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-2">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-400/90">
                {pack.shortName} formula
              </p>
              <p className="mt-1 text-sm text-slate-200">{formula}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tips
              </p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-slate-400">
                {SUMMARY_TIPS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Examples (tap Use to paste — rewrite with your facts)
              </p>
              {SUMMARY_EXAMPLES.map((ex) => (
                <div
                  key={ex.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 p-2"
                >
                  <p className="text-xs font-semibold text-slate-200">
                    {ex.title}
                    <span className="ml-1 font-normal text-slate-500">
                      · {ex.audience}
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {ex.text}
                  </p>
                  <CtaButton
                    className="mt-2 min-h-10 w-full text-xs"
                    variant="primary"
                    onClick={() => onChange(ex.text)}
                  >
                    Use as starting text
                  </CtaButton>
                </div>
              ))}
            </div>
          </ExampleTip>
        </div>
      </header>

      {coach && (
        <SectionCoach
          scaffold={coach}
          defaultOpen={!summary.trim()}
          onUseFillIn={onChange}
        />
      )}

      <label>
        <span className="rf-label">Summary</span>
        <textarea
          className="rf-input min-h-[140px] resize-y"
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Professional with … Track record of … measurable results you can prove…"
        />
      </label>
    </div>
  )
}
