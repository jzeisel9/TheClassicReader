/**
 * Loads scripts/seed-data/tao-te-ching.json into Supabase (service role).
 *
 * Requires in .env.local (or env):
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (Settings → API → service_role — server/seed only)
 *
 *   npx tsx scripts/seed-tao.mts
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
config({ path: join(root, '.env.local') })
config({ path: join(root, '.env') })

type SeedChapter = { number: number; paragraphs: unknown }
type SeedWord = {
  id: string
  label: string
  hanzi?: string
  pinyin?: string
  tagline: string
  body: string[]
  alternateTranslations: string[]
}
type StudyAliasGroup = { wordKey: string; aliases: string[] }

type SeedPayload = {
  slug: string
  title: string
  subtitle: string | null
  translator: string
  license_note: string
  chapters: SeedChapter[]
  glossary: Record<string, SeedWord>
  studyAliases?: StudyAliasGroup[]
}

const url =
  process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !serviceKey) {
  throw new Error(
    'Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local',
  )
}

const client = createClient(url, serviceKey, { auth: { persistSession: false } })

const jsonPath = join(
  dirname(fileURLToPath(import.meta.url)),
  'seed-data/tao-te-ching.json',
)
const data = JSON.parse(readFileSync(jsonPath, 'utf8')) as SeedPayload

const { error: delErr } = await client.from('works').delete().eq('slug', data.slug)
if (delErr) throw delErr

const { data: work, error: wErr } = await client
  .from('works')
  .insert({
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    translator: data.translator,
    license_note: data.license_note,
  })
  .select('id')
  .single()
if (wErr) throw wErr
if (!work) throw new Error('Insert work returned no row')

const workId = work.id as string

const chapterRows = data.chapters.map((ch) => ({
  work_id: workId,
  chapter_number: ch.number,
  paragraphs: ch.paragraphs,
}))
const { error: cErr } = await client.from('chapters').insert(chapterRows)
if (cErr) throw cErr

const wordRows = Object.entries(data.glossary).map(([wordKey, w]) => ({
  work_id: workId,
  word_key: wordKey,
  label: w.label,
  hanzi: w.hanzi ?? null,
  pinyin: w.pinyin ?? null,
  tagline: w.tagline,
  body: w.body,
  alternate_translations: w.alternateTranslations,
}))
const { error: gErr } = await client.from('word_studies').insert(wordRows)
if (gErr) throw gErr

const aliasGroups = data.studyAliases ?? []
const seenLower = new Set<string>()
const aliasRows: { work_id: string; word_key: string; alias: string }[] = []
for (const g of aliasGroups) {
  if (!data.glossary[g.wordKey]) continue
  for (const raw of g.aliases) {
    const alias = raw.trim()
    if (!alias) continue
    const low = alias.toLowerCase()
    if (seenLower.has(low)) continue
    seenLower.add(low)
    aliasRows.push({ work_id: workId, word_key: g.wordKey, alias })
  }
}
if (aliasRows.length > 0) {
  const { error: aErr } = await client.from('word_study_aliases').insert(aliasRows)
  if (aErr) throw aErr
}

console.log(
  'Seeded work',
  data.slug,
  'chapters',
  data.chapters.length,
  'words',
  wordRows.length,
  'aliases',
  aliasRows.length,
)
