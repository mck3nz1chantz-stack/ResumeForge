import type { ApplicationMode } from '../types/application'
import type { Contact } from '../types/profile'

/** Which master-profile emails print on a resume header. */
export type EmailInclude = {
  professional: boolean
  internal: boolean
}

/**
 * Sensible defaults by application mode:
 * - external → professional only (hide company email)
 * - internal → both (work first)
 */
export function defaultEmailInclude(mode: ApplicationMode): EmailInclude {
  if (mode === 'internal') {
    return { professional: true, internal: true }
  }
  return { professional: true, internal: false }
}

/** Emails for resume header — filtered by per-version include flags. */
export function contactEmailLines(
  contact: Contact,
  mode: ApplicationMode = 'external',
  include?: Partial<EmailInclude> | null,
): string[] {
  const pro = (contact.email ?? '').trim()
  const internal = (contact.emailInternal ?? '').trim()
  const flags = {
    ...defaultEmailInclude(mode),
    ...include,
  }
  const showPro = flags.professional && Boolean(pro)
  const showInt = flags.internal && Boolean(internal)

  if (mode === 'internal') {
    return [
      showInt ? internal : '',
      showPro ? pro : '',
    ].filter(Boolean)
  }
  return [
    showPro ? pro : '',
    showInt ? internal : '',
  ].filter(Boolean)
}

/** Full contact line bits: location, phone, emails, links. */
export function contactHeaderBits(
  contact: Contact,
  mode: ApplicationMode = 'external',
  include?: Partial<EmailInclude> | null,
): string[] {
  return [
    (contact.location ?? '').trim(),
    (contact.phone ?? '').trim(),
    ...contactEmailLines(contact, mode, include),
    (contact.linkedin ?? '').trim(),
    (contact.portfolio ?? '').trim(),
  ].filter(Boolean)
}

/** Labeled emails when both kinds print (plain text / PDF clarity). */
export function contactEmailsLabeled(
  contact: Contact,
  mode: ApplicationMode = 'external',
  include?: Partial<EmailInclude> | null,
): string[] {
  const pro = (contact.email ?? '').trim()
  const internal = (contact.emailInternal ?? '').trim()
  const flags = {
    ...defaultEmailInclude(mode),
    ...include,
  }
  const showPro = flags.professional && Boolean(pro)
  const showInt = flags.internal && Boolean(internal)

  if (showPro && showInt) {
    if (mode === 'internal') {
      return [`Work: ${internal}`, `Professional: ${pro}`]
    }
    return [`Professional: ${pro}`, `Work: ${internal}`]
  }
  if (showInt) return [internal]
  if (showPro) return [pro]
  return []
}
