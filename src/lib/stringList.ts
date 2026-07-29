/** Comma / newline separated tags → unique trimmed strings */
export function parseTagInput(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ]
}

export function joinTags(tags: string[]): string {
  return tags.join(', ')
}
