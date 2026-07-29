import { usePressFlash } from '../hooks/usePressFlash'
import type { NavSection } from '../types/profile'

export type MobileTab = 'preview' | 'contact' | 'summary' | 'more'

const TABS: {
  id: MobileTab
  label: string
  section: NavSection
  /** Simple monochrome glyph — not emoji */
  icon: string
}[] = [
  { id: 'preview', label: 'Layout', section: 'preview', icon: '▣' },
  { id: 'contact', label: 'Contact', section: 'contact', icon: '◎' },
  { id: 'summary', label: 'Summary', section: 'summary', icon: '☰' },
  { id: 'more', label: 'More', section: 'skills', icon: '···' },
]

type Props = {
  section: NavSection
  onNavigate: (section: NavSection, tab: MobileTab) => void
  appsCount: number
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
      className={`${active ? 'rf-bottom-tab rf-bottom-tab-active' : 'rf-bottom-tab'} ${stateClass}`}
      {...pressProps}
      onClick={() => {
        pressProps.onClick()
        onClick()
      }}
    >
      <span className="text-sm leading-none text-current" aria-hidden>
        {icon}
      </span>
      <span>
        {label}
        {badge ?? ''}
      </span>
    </button>
  )
}

export function MobileBottomNav({ section, onNavigate, appsCount }: Props) {
  const activeTab: MobileTab =
    section === 'preview'
      ? 'preview'
      : section === 'contact'
        ? 'contact'
        : section === 'summary'
          ? 'summary'
          : 'more'

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-[#0b0f14] lg:hidden no-print"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {TABS.map((tab) => (
          <li key={tab.id} className="flex-1">
            <BottomTabButton
              active={activeTab === tab.id}
              label={tab.label}
              icon={tab.icon}
              badge={
                tab.id === 'more' && appsCount > 0
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
