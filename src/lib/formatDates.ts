const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Accepts YYYY-MM, YYYY, or free text → display form */
export function formatDatePart(raw: string | null | undefined): string {
  if (raw == null || !String(raw).trim()) return ''
  const s = String(raw).trim()
  if (/^present$/i.test(s)) return 'Present'
  const ym = s.match(/^(\d{4})-(\d{1,2})$/)
  if (ym) {
    const month = Number(ym[2])
    const label = MONTHS[month - 1]
    return label ? `${label} ${ym[1]}` : ym[1]
  }
  if (/^\d{4}$/.test(s)) return s
  return s
}

export function formatDateRange(
  start: string,
  end: string | null | undefined,
): string {
  const a = formatDatePart(start)
  const b = end == null || !String(end).trim() ? 'Present' : formatDatePart(end)
  if (!a && !b) return ''
  if (!a) return b
  return `${a} – ${b}`
}
