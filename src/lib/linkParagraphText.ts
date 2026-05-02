import type { Paragraph, StudyLinkAlias, TextSegment } from '../types/reader'

/**
 * Letters, marks, numbers, and ASCII/typographic apostrophes count as “word”
 * characters for boundary checks (Legge-style English + contractions).
 */
const WORD_CHAR = /[\p{L}\p{M}\p{N}'\u2019]/u

function isWordChar(ch: string | undefined): boolean {
  if (!ch) return false
  return WORD_CHAR.test(ch)
}

/** True if `source[start:end]` is not a strict substring of a larger word. */
function hasWordBoundaryAround(source: string, start: number, end: number): boolean {
  if (isWordChar(source[start - 1])) return false
  if (isWordChar(source[end])) return false
  return true
}

/**
 * Splits plain text into text + keyword segments using edition-specific aliases.
 * - Aliases are tried longest-first so e.g. “non-being” wins over “being”.
 * - Matching is case-insensitive.
 * - Only whole-token matches (no “be” inside “because”).
 */
export function linkParagraphText(
  source: string,
  linkAliases: StudyLinkAlias[],
): TextSegment[] {
  if (linkAliases.length === 0) {
    return [{ type: 'text', text: source }]
  }

  const byLower = new Map<string, StudyLinkAlias>()
  for (const a of linkAliases) {
    if (!a.alias) continue
    const k = a.alias.toLowerCase()
    if (!byLower.has(k)) byLower.set(k, a)
  }
  const sorted = [...byLower.values()].sort((a, b) => b.alias.length - a.alias.length)

  const out: TextSegment[] = []
  let runStart = 0
  let i = 0

  while (i < source.length) {
    let hit: { len: number; wordId: string; surface: string } | null = null
    for (const a of sorted) {
      const L = a.alias.length
      if (L === 0) continue
      if (i + L > source.length) continue
      if (source.slice(i, i + L).toLowerCase() !== a.alias.toLowerCase()) continue
      if (!hasWordBoundaryAround(source, i, i + L)) continue
      hit = { len: L, wordId: a.wordId, surface: source.slice(i, i + L) }
      break
    }
    if (hit) {
      if (runStart < i) out.push({ type: 'text', text: source.slice(runStart, i) })
      out.push({ type: 'keyword', text: hit.surface, wordId: hit.wordId })
      runStart = i + hit.len
      i = runStart
    } else {
      i += 1
    }
  }

  if (runStart < source.length) {
    out.push({ type: 'text', text: source.slice(runStart) })
  }

  return out.length ? out : [{ type: 'text', text: '' }]
}

function mergeAdjacentTextSegments(segs: TextSegment[]): TextSegment[] {
  const r: TextSegment[] = []
  for (const s of segs) {
    const last = r[r.length - 1]
    if (s.type === 'text' && last?.type === 'text') {
      last.text += s.text
    } else if (s.type === 'text') {
      r.push({ type: 'text', text: s.text })
    } else {
      r.push(s)
    }
  }
  return r.length ? r : [{ type: 'text', text: '' }]
}

/** Runs auto-linking on `text` segments; leaves existing `keyword` segments as-is. */
export function expandParagraphWithAliases(
  paragraph: Paragraph,
  linkAliases: StudyLinkAlias[],
): Paragraph {
  const merged: TextSegment[] = []
  for (const seg of paragraph) {
    if (seg.type === 'keyword') {
      merged.push(seg)
      continue
    }
    merged.push(...linkParagraphText(seg.text, linkAliases))
  }
  return mergeAdjacentTextSegments(merged)
}
