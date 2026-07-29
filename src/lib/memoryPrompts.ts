/** Memory-first prompts while capturing a role (manufacturing-first). */

export const MEMORY_PROMPTS = [
  'What did a typical day look like?',
  'Any safety, quality, or rate numbers you remember?',
  'Machines, tools, or systems you used?',
  'People you trained, led, or covered for?',
  'Problems you fixed or process you improved?',
  'Anything you’re proud of from that role?',
] as const

export function suggestBulletsFromMemory(text: string): string[] {
  return text
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}
