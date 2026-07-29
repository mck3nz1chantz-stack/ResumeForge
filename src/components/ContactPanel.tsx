import type { Contact } from '../types/profile'
import { scaffoldFor } from '../data/expertScaffolds'
import { SectionCoach } from './SectionCoach'
import { SectionGuide } from './SectionGuide'

type Props = {
  contact: Contact
  onChange: (contact: Contact) => void
}

export function ContactPanel({ contact, onChange }: Props) {
  const set =
    (key: keyof Contact) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...contact, [key]: e.target.value })
    }

  const coach = scaffoldFor('contact')

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-50">
            Step 2 · Contact
          </h2>
          <p className="text-sm text-slate-400">
            Header of the resume: name,{' '}
            <strong className="text-slate-300">your</strong> phone, emails,
            city. Employer plant address/phone belong on each job (notes only) —
            not here. Store both emails; each build chooses which print
            (external hides work email by default).
          </p>
        </div>
        <SectionGuide guideId="contact" />
      </header>
      {coach && <SectionCoach scaffold={coach} defaultOpen={!contact.name.trim()} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" value={contact.name} onChange={set('name')} />
        <Field
          label="Your phone (prints on resume)"
          value={contact.phone}
          onChange={set('phone')}
          type="tel"
          placeholder="Cell or best reach number — not the plant switchboard"
        />
        <Field
          label="Professional email"
          value={contact.email}
          onChange={set('email')}
          type="email"
          placeholder="you@gmail.com · external applications"
          className="sm:col-span-2"
        />
        <Field
          label="Work / internal email"
          value={contact.emailInternal ?? ''}
          onChange={set('emailInternal')}
          type="email"
          placeholder="you@company.com · internal promotions"
          className="sm:col-span-2"
        />
        <Field
          label="Your location (City, ST)"
          value={contact.location}
          onChange={set('location')}
          placeholder="Muskegon, MI — skip full street for ATS"
        />
        <Field
          label="LinkedIn URL"
          value={contact.linkedin ?? ''}
          onChange={set('linkedin')}
          placeholder="https://linkedin.com/in/…"
        />
        <Field
          label="Portfolio / site (optional)"
          value={contact.portfolio ?? ''}
          onChange={set('portfolio')}
          className="sm:col-span-2"
        />
      </div>
      {!(contact.linkedin ?? '').trim() && (
        <p className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs leading-relaxed text-slate-400">
          <span className="font-medium text-slate-300">Soft tip · LinkedIn — </span>
          If you keep a current profile, add the URL. Research links complete
          LinkedIn profiles to higher callback rates vs none or a bare shell.
          Skip it if you don’t use LinkedIn — never invent a profile.
        </p>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className = '',
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  className?: string
}) {
  return (
    <label className={className}>
      <span className="rf-label">{label}</span>
      <input
        className="rf-input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  )
}
