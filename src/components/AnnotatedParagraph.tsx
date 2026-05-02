import { useMemo } from 'react'
import { expandParagraphWithAliases } from '../lib/linkParagraphText'
import type { Paragraph, Work } from '../types/reader'
import { KeywordLink } from './KeywordLink'

type Props = {
  paragraph: Paragraph
  work: Work
  onOpenKeyword: (wordId: string) => void
}

export function AnnotatedParagraph({ paragraph, work, onOpenKeyword }: Props) {
  const expanded = useMemo(
    () => expandParagraphWithAliases(paragraph, work.linkAliases),
    [paragraph, work.linkAliases],
  )

  return (
    <p className="mb-5 text-justify last:mb-0 md:text-[1.08rem] md:leading-[1.72]">
      {expanded.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.text}</span>
        }
        const hint = work.glossary[seg.wordId]?.tagline
        return (
          <KeywordLink
            key={i}
            wordId={seg.wordId}
            hint={hint}
            onOpen={onOpenKeyword}
          >
            {seg.text}
          </KeywordLink>
        )
      })}
    </p>
  )
}
