import { usePressFlash } from '../hooks/usePressFlash'
import type { NavSection } from '../types/profile'

export type MobileTab = 'preview' | 'jobs' | 'applications' | 'more'

const TABS: {
  id: MobileTab
  label: string
  section: NavSection
  /** Simple monochrome glyph — not emoji */
  icon: string
}[] = [
  { id: 'preview', label: 'Layout', section: 'preview', icon: '▣' },
  { id: 'jobs', label: 'Jobs', section: 'jobs', icon: '☰' },
  { id: 'applications', label: 'Build', section: 'applications', icon: '◆' },
  { id: 'more', label: 'More', section: 'skills', icon: '···' },
]

type Props = {
  section: NavSection
  onNavigate: (section: NavSection, tab: MobileTab) => void
  appsCount: number
  /** When More hub is open */
  moreHub?: boolean
}

function BottomTabButton({
  active,
  label,
  icon,
  badge,
  onClick,
}: {
  active: boolean
  label: string
  icon: string
  badge?: string
  onClick: () => void
}) {
  const { stateClass, pressProps } = usePressFlash(280)
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={`${active ? 'rf-bottom-tab rf-bottom-tab-active' : 'rf-bottom-tab'} ${stateClass} touch-manipulation`}
      {...pressProps}
      onClick={() => {
        pressProps.onClick()
        onClick()
      }}
    >
      <span className="text-sm leading-none text-current" aria-hidden>
        {icon}
      </span>
      <span className="max-w-full truncate px-0.5">
        {label}
        {badge ?? ''}
      </span>
    </button>
  )
}

/**
 * Phone primary chrome — resume-critical destinations only.
 * Full step path still lives in horizontal BuildStepTabs above the editor.
 */
export function MobileBottomNav({
  section,
  onNavigate,
  appsCount,
  moreHub = false,
}: Props) {
  const activeTab: MobileTab = moreHub
    ? 'more'
    : section === 'preview'
      ? 'preview'
      : section === 'jobs'
        ? 'jobs'
        : section === 'applications'
          ? 'applications'
          : 'more'

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-[#0b0f14]/98 backdrop-blur-sm lg:hidden no-print"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {TABS.map((tab) => (
          <li key={tab.id} className="flex min-w-0 flex-1">
            <BottomTabButton
              active={activeTab === tab.id}
              label={tab.label}
              icon={tab.icon}
              badge={
                tab.id === 'applications' && appsCount > 0
                  ? ` ${appsCount}`
                  : undefined
              }
              onClick={() => onNavigate(tab.section, tab.id)}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
