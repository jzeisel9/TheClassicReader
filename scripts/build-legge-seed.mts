/**
 * Rebuilds scripts/seed-data/tao-te-ching.json from Project Gutenberg #216
 * (Legge translation) plus the existing glossary from the current seed file.
 *
 *   npx tsx scripts/build-legge-seed.mts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pgPath = join(root, 'scripts/sources/pg216.txt')
const seedPath = join(root, 'scripts/seed-data/tao-te-ching.json')

type TextSeg = { type: 'text'; text: string }
type Para = TextSeg[]

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
  chapters: { number: number; paragraphs: unknown }[]
  glossary: Record<string, SeedWord>
  studyAliases?: StudyAliasGroup[]
}

function sliceBodyLines(allLines: string[]): string[] {
  let i = 0
  while (i < allLines.length) {
    if (/^PART 1\./i.test(allLines[i].trim())) break
    i++
  }
  if (i >= allLines.length) throw new Error('PART 1. not found')
  const start = i + 1
  let j = start
  while (j < allLines.length) {
    const t = allLines[j]
    if (t.includes('*** END OF THE PROJECT GUTENBERG')) break
    j++
  }
  return allLines.slice(start, j)
}

/** Returns line indices where each chapter 1..81 begins (inclusive). */
function findChapterStartLines(lines: string[]): number[] {
  const starts: number[] = []
  let nextChapter = 1
  let i = 0

  while (i < lines.length && nextChapter <= 81) {
    const raw = lines[i]
    const t = raw.trim()

    const tryMatch = (): boolean => {
      const N = nextChapter

      if (N === 1) {
        const m = t.match(/^Ch\.\s*1\./i)
        if (m) return true
      }

      if (new RegExp(`^${N}\\.\\s+1\\.\\s+\\S`).test(t)) return true

      if (new RegExp(`^${N}\\.\\s*$`).test(t)) return true

      if (N >= 10 && new RegExp(`^${N}\\.\\s+(?!1\\.\\s)`).test(t)) return true

      return false
    }

    if (tryMatch()) {
      starts.push(i)
      nextChapter++
    }
    i++
  }

  if (starts.length !== 81) {
    throw new Error(
      `Expected 81 chapter starts, found ${starts.length} (nextChapter stuck at ${nextChapter})`,
    )
  }
  return starts
}

function stripChapterPrefix(line: string, chapterNum: number): string {
  let t = line.trim()
  if (chapterNum === 1) {
    t = t.replace(/^Ch\.\s*1\.\s*/i, '')
  } else {
    if (new RegExp(`^${chapterNum}\\.\\s*$`).test(t)) return ''
    t = t.replace(new RegExp(`^${chapterNum}\\.\\s+`), '')
  }
  return t
}

function linesToParagraphs(chapterLines: string[], chapterNum: number): Para[] {
  if (chapterLines.length === 0) return [[{ type: 'text', text: '' }]]

  const first = stripChapterPrefix(chapterLines[0], chapterNum).trim()
  const rest = chapterLines.slice(1).map((l) => l.trimEnd())
  const all = first ? [first, ...rest] : rest

  const chunks: string[][] = []
  let buf: string[] = []

  const flush = () => {
    if (buf.length) chunks.push(buf)
    buf = []
  }

  for (const line of all) {
    const trimmed = line.trim()
    if (!trimmed) {
      flush()
      continue
    }
    buf.push(trimmed)
  }
  flush()

  for (let k = 0; k < chunks.length - 1; ) {
    const lone = chunks[k].join(' ').replace(/\s+/g, ' ').trim()
    if (/^\d+\.$/.test(lone)) {
      chunks[k + 1] = [...chunks[k], ...chunks[k + 1]]
      chunks.splice(k, 1)
      continue
    }
    k++
  }

  const paras: Para[] = []
  for (const b of chunks) {
    const text = b.join(' ').replace(/\s+/g, ' ').trim()
    if (text) paras.push([{ type: 'text', text }])
  }

  return paras.length ? paras : [[{ type: 'text', text: '' }]]
}

function parseGutenberg(): { number: number; paragraphs: Para[] }[] {
  const raw = readFileSync(pgPath, 'utf8').replace(/\r\n/g, '\n')
  const allLines = raw.split('\n')
  const body = sliceBodyLines(allLines)
  const starts = findChapterStartLines(body)

  const chapters: { number: number; paragraphs: Para[] }[] = []
  for (let c = 0; c < 81; c++) {
    const num = c + 1
    const from = starts[c]
    const to = c + 1 < 81 ? starts[c + 1] : body.length
    const slice = body.slice(from, to).map((l) => l.trimEnd())
    chapters.push({ number: num, paragraphs: linesToParagraphs(slice, num) })
  }
  return chapters
}

const existing = JSON.parse(readFileSync(seedPath, 'utf8')) as SeedPayload
const chapters = parseGutenberg()

const out: SeedPayload = {
  slug: existing.slug,
  title: existing.title,
  subtitle: existing.subtitle,
  translator: existing.translator,
  license_note:
    'James Legge translation (1891), via Project Gutenberg eBook #216 (public domain). Word studies are original to The Classic Reader.',
  chapters,
  glossary: existing.glossary,
  studyAliases: existing.studyAliases,
}

writeFileSync(seedPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8')
console.log('Wrote', seedPath, '—', chapters.length, 'chapters')
