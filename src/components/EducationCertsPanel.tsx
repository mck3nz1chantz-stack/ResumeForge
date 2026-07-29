import type { Cert, Education } from '../types/profile'
import { scaffoldFor } from '../data/expertScaffolds'
import { uid } from '../lib/id'
import { SectionCoach } from './SectionCoach'
import { SectionGuide } from './SectionGuide'

type EduProps = {
  education: Education[]
  onChange: (education: Education[]) => void
}

export function EducationPanel({ education, onChange }: EduProps) {
  const add = () =>
    onChange([
      ...education,
      { id: uid('edu'), school: '', credential: '', year: '', notes: '' },
    ])

  const coach = scaffoldFor('education')

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-50">
            Step 6 · Education
          </h2>
          <p className="text-sm text-slate-400">Degrees, trade school, relevant coursework.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SectionGuide guideId="education" />
          <button type="button" className="rf-btn rf-btn-primary" onClick={add}>
            + Add
          </button>
        </div>
      </header>
      {coach && (
        <SectionCoach scaffold={coach} defaultOpen={education.length === 0} />
      )}
      {education.length === 0 && (
        <p className="text-sm text-slate-500">Optional for experienced manufacturing roles — still useful.</p>
      )}
      <div className="space-y-3">
        {education.map((ed) => (
          <div key={ed.id} className="rf-card grid gap-3 sm:grid-cols-2">
            <label>
              <span className="rf-label">School</span>
              <input
                className="rf-input"
                value={ed.school}
                onChange={(e) =>
                  onChange(education.map((x) => (x.id === ed.id ? { ...x, school: e.target.value } : x)))
                }
              />
            </label>
            <label>
              <span className="rf-label">Credential</span>
              <input
                className="rf-input"
                value={ed.credential}
                onChange={(e) =>
                  onChange(
                    education.map((x) =>
                      x.id === ed.id ? { ...x, credential: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label>
              <span className="rf-label">Year</span>
              <input
                className="rf-input"
                value={ed.year ?? ''}
                onChange={(e) =>
                  onChange(education.map((x) => (x.id === ed.id ? { ...x, year: e.target.value } : x)))
                }
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                className="rf-btn rf-btn-danger"
                onClick={() => onChange(education.filter((x) => x.id !== ed.id))}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type CertProps = {
  certs: Cert[]
  onChange: (certs: Cert[]) => void
}

export function CertsPanel({ certs, onChange }: CertProps) {
  const add = () =>
    onChange([
      ...certs,
      { id: uid('cert'), name: '', issuer: '', year: '', expires: '' },
    ])

  const coach = scaffoldFor('certs')

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-50">
            Step 7 · Certifications
          </h2>
          <p className="text-sm text-slate-400">
            High weight for manufacturing: OSHA, forklift, lean belt, welding, etc.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SectionGuide guideId="certs" />
          <button type="button" className="rf-btn rf-btn-primary" onClick={add}>
            + Add
          </button>
        </div>
      </header>
      {coach && <SectionCoach scaffold={coach} defaultOpen={certs.length === 0} />}
      <div className="space-y-3">
        {certs.map((c) => (
          <div key={c.id} className="rf-card grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="rf-label">Name</span>
              <input
                className="rf-input"
                value={c.name}
                onChange={(e) =>
                  onChange(certs.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))
                }
                placeholder="OSHA 10 · Forklift · Lean Yellow Belt"
              />
            </label>
            <label>
              <span className="rf-label">Issuer</span>
              <input
                className="rf-input"
                value={c.issuer ?? ''}
                onChange={(e) =>
                  onChange(certs.map((x) => (x.id === c.id ? { ...x, issuer: e.target.value } : x)))
                }
              />
            </label>
            <label>
              <span className="rf-label">Year</span>
              <input
                className="rf-input"
                value={c.year ?? ''}
                onChange={(e) =>
                  onChange(certs.map((x) => (x.id === c.id ? { ...x, year: e.target.value } : x)))
                }
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="button"
                className="rf-btn rf-btn-danger"
                onClick={() => onChange(certs.filter((x) => x.id !== c.id))}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
