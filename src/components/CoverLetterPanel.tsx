import { useMemo } from 'react'
import type { ResumeApplication } from '../types/application'
import type { ResumeProfile } from '../types/profile'
import { CtaButton } from './CtaButton'
import { touchApplication } from '../lib/applicationFactory'
import {
  defaultCoverLetterStub,
  downloadCoverLetterTxt,
} from '../lib/coverLetter'

type Props = {
  profile: ResumeProfile
  application: ResumeApplication | null
  onApplicationChange: (app: ResumeApplication) => void
  onOpenApplications: () => void
}

/**
 * Phase 7 — cover letter stub (plain text, per application, no auto-send).
 */
export function CoverLetterPanel({
  profile,
  application,
  onApplicationChange,
  onOpenApplications,
}: Props) {
  const stub = useMemo(
    () => defaultCoverLetterStub(profile, application),
    [profile, application],
  )

  if (!application) {
    return (
      <div className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-slate-50">Cover letter</h2>
          <p className="text-sm text-slate-400">
            Optional stub letter tied to a named application. Edit placeholders
            with real facts only.
          </p>
        </header>
        <div className="rf-card space-y-3 border-amber-900/40 bg-amber-950/20">
          <p className="text-sm text-amber-100">
            Select or create an application first — the letter saves on that
            application.
          </p>
          <CtaButton
            variant="primary"
            className="min-h-11"
            onClick={onOpenApplications}
          >
            Open Applications
          </CtaButton>
        </div>
      </div>
    )
  }

  const body = application.coverLetter || ''

  const patch = (coverLetter: string) => {
    onApplicationChange(touchApplication({ ...application, coverLetter }))
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Cover letter</h2>
          <p className="text-sm text-slate-400">
            Application:{' '}
            <span className="text-slate-200">
              {application.label || 'Untitled'}
            </span>
            {application.targetTitle
              ? ` · ${application.targetTitle}`
              : ''}
            {application.targetCompany
              ? ` @ ${application.targetCompany}`
              : ''}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Stub only — not auto-sent. Replace every bracketed claim with truth.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <CtaButton
          variant="primary"
          className="min-h-11"
          onClick={() => patch(stub)}
        >
          {body.trim() ? 'Reset from template' : 'Insert template'}
        </CtaButton>
        <CtaButton
          className="min-h-11"
          disabled={!body.trim()}
          actionLabels={{ busy: '…', done: 'Saved ✓' }}
          onAsyncClick={async () => {
            downloadCoverLetterTxt(body, application.label)
          }}
        >
          Download .txt
        </CtaButton>
        <CtaButton
          className="min-h-11"
          disabled={!body.trim()}
          onClick={() => void navigator.clipboard.writeText(body)}
        >
          Copy
        </CtaButton>
      </div>

      <label>
        <span className="rf-label">Letter body</span>
        <textarea
          className="rf-input min-h-[320px] resize-y font-serif text-sm leading-relaxed"
          value={body}
          onChange={(e) => patch(e.target.value)}
          placeholder="Insert template, then personalize…"
          spellCheck
        />
      </label>

      <div className="rf-card border-slate-800 text-xs text-slate-500">
        Tips: keep to ~½–¾ page · name the role and company · one real proof ·
        no invented metrics · internal letters should sound like readiness, not
        a cold hire pitch.
      </div>
    </div>
  )
}
