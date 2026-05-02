export type TextSegment =
  | { type: 'text'; text: string }
  | { type: 'keyword'; text: string; wordId: string }

export type Paragraph = TextSegment[]

export type Chapter = {
  number: number
  paragraphs: Paragraph[]
}

export type WordStudy = {
  id: string
  /** Matches visible token; drawer title */
  label: string
  hanzi?: string
  pinyin?: string
  /** One-line hook */
  tagline: string
  /** Rich paragraphs */
  body: string[]
  /** Other English glosses translators use */
  alternateTranslations: string[]
}

/** Surface strings in this edition that open `wordId` in the glossary (many aliases → one study). */
export type StudyLinkAlias = {
  alias: string
  wordId: string
}

export type Work = {
  id: string
  title: string
  subtitle?: string
  translator: string
  licenseNote: string
  chapters: Chapter[]
  glossary: Record<string, WordStudy>
  /** From `word_study_aliases`; used to auto-highlight plain text paragraphs. */
  linkAliases: StudyLinkAlias[]
}

export type BookListItem = {
  id: string
  title: string
  author: string
  /** Approximate period or date of composition (display only). */
  written: string
  /** Title in the original language / script. */
  originalTitle: string
  available: boolean
}
