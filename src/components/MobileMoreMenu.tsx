import { CtaButton } from './CtaButton'
import { usePressFlash } from '../hooks/usePressFlash'
import type { NavSection } from '../types/profile'

const ITEMS: { id: NavSection; label: string; hint: string }[] = [
  { id: 'preview', label: '1 · Layout', hint: 'Template & export first' },
  { id: 'contact', label: '2 · Contact', hint: 'Name, emails, phone, city' },
  { id: 'summary', label: '3 · Summary', hint: 'Professional summary (header)' },
  { id: 'skills', label: '4 · Skills', hint: 'Master skills bank' },
  { id: 'jobs', label: '5 · Experience', hint: 'Master job bank' },
  { id: 'education', label: '6 · Education', hint: 'School & credentials' },
  { id: 'certs', label: '7 · Certs', hint: 'OSHA, forklift, lean…' },
  { id: 'applications', label: '8 · This build', hint: 'Jobs/skills pick · emails · tone' },
  { id: 'jd-tailor', label: 'JD keywords', hint: 'Paste JD · match checklist · pin bullets' },
  { id: 'internal-promo', label: 'Internal promo', hint: 'Company · titles · readiness' },
  { id: 'library', label: 'Achievements', hint: 'Library + light polish accept/reject' },
  { id: 'cover-letter', label: 'Cover letter', hint: 'Stub letter per application' },
  { id: 'industry-pack', label: 'Industry pack', hint: 'Mfg / corporate / CS prompts' },
]

type Props = {
  section: NavSection
  onSelect: (section: NavSection) => void
  onExportProfile: () => void
  onImportClick: () => void
  onReset: () => void
  onRestartGuide?: () => void
  onStartLeverage?: () => void
  onHowToUse?: () => void
}

export function MobileMoreMenu({
  section,
  onSelect,
  onExportProfile,
  onImportClick,
  onReset,
  onRestartGuide,
  onStartLeverage,
  onHowToUse,
}: Props) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">More</h2>
        <p className="text-sm text-slate-400">
          Full build path in resume order (Layout → Contact → Summary → …). Data
          stays on-device — export JSON to move between desktop and phone.
        </p>
      </header>

      {onHowToUse && (
        <CtaButton
          variant="primary"
          className="min-h-12 w-full font-semibold"
          onClick={onHowToUse}
        >
          How to use (tutorial)
        </CtaButton>
      )}

      <ul className="space-y-1">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <MoreRow
              active={section === item.id}
              label={item.label}
              hint={item.hint}
              onClick={() => onSelect(item.id)}
            />
          </li>
        ))}
      </ul>

      <div className="rf-card space-y-2 border-emerald-900/40 bg-emerald-950/15">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/90">
          Private · this device only
        </p>
        <p className="text-xs text-slate-400">
          No account and no cloud for your resume. Export downloads one JSON you
          own (master profile + builds). Import that file on another device —
          still local there.
        </p>
        {onStartLeverage && (
          <CtaButton
            variant="primary"
            className="min-h-12 w-full"
            onClick={onStartLeverage}
          >
            Target-first leverage
          </CtaButton>
        )}
        {onRestartGuide && (
          <CtaButton className="min-h-12 w-full" onClick={onRestartGuide}>
            Restart setup (choose path)
          </CtaButton>
        )}
        <CtaButton
          variant="primary"
          className="min-h-12 w-full"
          actionLabels={{
            busy: '…',
            done: 'Exported ✓',
            error: 'Export failed',
          }}
          onAsyncClick={async () => {
            onExportProfile()
          }}
        >
          Export full backup
        </CtaButton>
        <CtaButton className="min-h-12 w-full" onClick={onImportClick}>
          Import backup
        </CtaButton>
        <CtaButton
          variant="danger"
          className="min-h-12 w-full"
          onClick={onReset}
        >
          Reset profile
        </CtaButton>
      </div>

      <p className="text-xs leading-relaxed text-slate-600">
        Tip for work: create Applications at home, install ResumeForge to your
        home screen, then on short notice open Apps → edit target → PDF.
      </p>
    </div>
  )
}

function MoreRow({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean
  label: string
  hint: string
  onClick: () => void
}) {
  const { stateClass, pressProps } = usePressFlash(280)
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={`rf-clickable flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${stateClass} ${
        active
          ? 'rf-clickable-selected text-amber-50'
          : 'border-slate-800 bg-slate-900/50 text-slate-200'
      }`}
      onPointerDown={pressProps.onPointerDown}
      onPointerUp={pressProps.onPointerUp}
      onPointerCancel={pressProps.onPointerCancel}
      onPointerLeave={pressProps.onPointerLeave}
      onClick={() => {
        pressProps.onClick()
        onClick()
      }}
    >
      <span className="font-medium">
        {label}
        {active ? (
          <span className="ml-1 text-xs text-amber-400">✓</span>
        ) : null}
      </span>
      <span className="text-xs text-slate-500">{hint}</span>
    </button>
  )
}
