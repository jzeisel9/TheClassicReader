import type {
  Chapter,
  StudyLinkAlias,
  TextSegment,
  WordStudy,
  Work,
} from '../types/reader'
import { supabase } from './supabaseClient'

type WorkRow = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  translator: string
  license_note: string
}

type ChapterRow = {
  chapter_number: number
  paragraphs: unknown
}

type WordStudyRow = {
  word_key: string
  label: string
  hanzi: string | null
  pinyin: string | null
  tagline: string
  body: unknown
  alternate_translations: string[] | null
}

type WordStudyAliasRow = {
  word_key: string
  alias: string
}

function isTextSegment(x: unknown): x is TextSegment {
  if (!x || typeof x !== 'object') return false
  const o = x as { type?: string; text?: string; wordId?: string }
  if (o.type === 'text') return typeof o.text === 'string'
  if (o.type === 'keyword')
    return typeof o.text === 'string' && typeof o.wordId === 'string'
  return false
}

function parseParagraphs(raw: unknown): Chapter['paragraphs'] {
  if (!Array.isArray(raw)) return []
  const out: Chapter['paragraphs'] = []
  for (const para of raw) {
    if (!Array.isArray(para)) continue
    const segs: TextSegment[] = []
    for (const seg of para) {
      if (isTextSegment(seg)) segs.push(seg)
    }
    if (segs.length) out.push(segs)
  }
  return out
}

/**
 * Load a work by slug (e.g. `tao-te-ching`) for the reader UI.
 */
export async function fetchWorkBySlug(slug: string): Promise<Work | null> {
  if (!supabase) return null

  const { data: work, error: wErr } = await supabase
    .from('works')
    .select('id, slug, title, subtitle, translator, license_note')
    .eq('slug', slug)
    .maybeSingle()

  if (wErr) throw wErr
  if (!work) return null

  const wr = work as WorkRow

  const { data: chList, error: cErr } = await supabase
    .from('chapters')
    .select('chapter_number, paragraphs')
    .eq('work_id', wr.id)
    .order('chapter_number', { ascending: true })

  if (cErr) throw cErr

  const { data: wsList, error: gErr } = await supabase
    .from('word_studies')
    .select(
      'word_key, label, hanzi, pinyin, tagline, body, alternate_translations',
    )
    .eq('work_id', wr.id)

  if (gErr) throw gErr

  const { data: aliasList, error: aErr } = await supabase
    .from('word_study_aliases')
    .select('word_key, alias')
    .eq('work_id', wr.id)

  if (aErr) throw aErr

  const glossary: Record<string, WordStudy> = {}
  for (const row of (wsList ?? []) as WordStudyRow[]) {
    const body = Array.isArray(row.body)
      ? row.body.filter((p): p is string => typeof p === 'string')
      : []
    glossary[row.word_key] = {
      id: row.word_key,
      label: row.label,
      hanzi: row.hanzi ?? undefined,
      pinyin: row.pinyin ?? undefined,
      tagline: row.tagline,
      body,
      alternateTranslations: row.alternate_translations ?? [],
    }
  }

  const linkAliases: StudyLinkAlias[] = ((aliasList ?? []) as WordStudyAliasRow[])
    .filter((row) => glossary[row.word_key])
    .map((row) => ({ alias: row.alias, wordId: row.word_key }))

  const chapters: Chapter[] = ((chList ?? []) as ChapterRow[]).map((r) => ({
    number: r.chapter_number,
    paragraphs: parseParagraphs(r.paragraphs),
  }))

  return {
    id: wr.slug,
    title: wr.title,
    subtitle: wr.subtitle ?? undefined,
    translator: wr.translator,
    licenseNote: wr.license_note,
    chapters,
    glossary,
    linkAliases,
  }
}
