import type { SectionGuideId } from '../data/sectionGuides'
import { sectionGuide } from '../data/sectionGuides'
import { ExampleTip } from './ExampleTip'

type Props = {
  guideId: SectionGuideId
  /** Trigger label */
  label?: string
  className?: string
}

/**
 * Offline structure + length guide for operator-written sections.
 * No AI — shows shape, length targets, tips, and avoid list.
 */
export function SectionGuide({
  guideId,
  label = 'Structure & length',
  className = '',
}: Props) {
  const g = sectionGuide(guideId)

  return (
    <ExampleTip label={label} title={g.title} className={className}>
      <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400/90">
          Keep it
        </p>
        <p className="mt-1 text-sm font-medium text-amber-50">{g.length}</p>
        <p className="mt-1 text-[11px] text-slate-500">3-C focus: {g.threeC}</p>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Structure (in order)
        </p>
        <ol className="mt-1 list-inside list-decimal space-y-1 text-xs text-slate-300">
          {g.structure.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Do
        </p>
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-slate-400">
          {g.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Avoid
        </p>
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-red-200/70">
          {g.avoid.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">
        You write the language. This guide only shapes length and structure —
        never invent metrics or titles you do not hold.
      </p>
    </ExampleTip>
  )
}
