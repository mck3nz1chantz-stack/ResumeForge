import { useEffect, useState } from 'react'
import {
  GITHUB_REPO_HINT,
  GITHUB_REPO_LABEL,
  GITHUB_REPO_URL,
} from '../data/projectLinks'
import {
  dismissInstallBanner,
  isInstallBannerDismissed,
  isLikelyAndroid,
  isLikelyIos,
  isStandaloneDisplay,
} from '../lib/pwaInstall'
import { CtaButton } from './CtaButton'

type Props = {
  /** Hide on desktop layout (≥ lg) — parent can also gate with CSS */
  className?: string
}

/**
 * Phone-first: how to install PWA + pointer to GitHub for full local install.
 * Hidden when already running as installed standalone, or dismissed.
 */
export function MobileInstallBanner({ className = '' }: Props) {
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)
  const [android, setAndroid] = useState(false)

  useEffect(() => {
    if (isStandaloneDisplay()) return
    if (isInstallBannerDismissed()) return
    // Only push install UX on narrow / coarse pointers (phones & small tablets)
    const narrow =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1023px)').matches
    if (!narrow) return
    setIos(isLikelyIos())
    setAndroid(isLikelyAndroid())
    setShow(true)
  }, [])

  if (!show) return null

  const steps = ios
    ? 'Safari → Share → Add to Home Screen'
    : android
      ? 'Chrome menu ⋮ → Install app / Add to Home screen'
      : 'Browser menu → Install app or Add to Home Screen'

  return (
    <div
      className={`no-print rounded-xl border border-sky-900/50 bg-sky-950/25 p-3 sm:p-3.5 lg:hidden ${className}`}
      role="region"
      aria-label="Install on this device"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-100">
            Install on this phone
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Add ResumeForge to your home screen for one-tap open. Your resume
            data stays in this browser only — still no account.
          </p>
          <p className="mt-2 rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-2 text-xs font-medium text-slate-200">
            {steps}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Prefer full control on a computer? Clone from GitHub and run locally
            (needs Node). Share the GitHub link, not a temporary demo host.
          </p>
        </div>
        <CtaButton
          className="min-h-10 shrink-0 text-xs"
          onClick={() => {
            dismissInstallBanner()
            setShow(false)
          }}
        >
          Dismiss
        </CtaButton>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rf-btn rf-btn-primary flex min-h-11 flex-1 items-center justify-center text-center text-sm font-semibold"
          title={GITHUB_REPO_HINT}
        >
          {GITHUB_REPO_LABEL}
        </a>
      </div>
    </div>
  )
}
