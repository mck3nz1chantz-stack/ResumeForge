import type { NavSection } from '../types/profile'
import { nextFlowSection, sectionStepLabel } from '../lib/buildSteps'
import { CtaButton } from './CtaButton'

type Props = {
  /** Active application label or null for master */
  activeLabel: string | null
  section: NavSection
  onContinue: (section: NavSection) => void
  onOpenLayouts: () => void
  onNewBuild?: () => void
}

/**
 * Persistent “where am I / next in resume order” strip.
 * Continue follows: Layout → Contact → Summary → Skills → Experience → Edu → Certs → This build.
 */
export function BuildContinueBar({
  activeLabel,
  section,
  onContinue,
  onOpenLayouts,
  onNewBuild,
}: Props) {
  const next = nextFlowSection(section)
  const onLayout = section === 'preview'

  return (
    <div className="no-print flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {activeLabel ? 'Current build' : 'Master bank'} · resume order
        </p>
        <p className="truncate text-sm text-slate-200">
          {activeLabel ? (
            <span className="font-medium text-amber-100/90">{activeLabel}</span>
          ) : (
            <span className="text-slate-400">
              No build yet — use New Build for a role
            </span>
          )}
          <span className="text-slate-600"> · </span>
          <span className="text-slate-400">{sectionStepLabel(section)}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {onNewBuild && !activeLabel && (
          <CtaButton
            variant="primary"
            className="min-h-10 text-xs font-semibold"
            onClick={onNewBuild}
          >
            + New Build
          </CtaButton>
        )}
        <CtaButton
          variant={activeLabel || !onNewBuild ? 'primary' : 'default'}
          className="min-h-10 text-xs font-semibold"
          onClick={() => onContinue(next.id)}
        >
          {next.label}
        </CtaButton>
        {!onLayout && (
          <CtaButton className="min-h-10 text-xs" onClick={onOpenLayouts}>
            Layout
          </CtaButton>
        )}
      </div>
    </div>
  )
}
