import type { Work } from '../types/reader'
import { AnnotatedParagraph } from './AnnotatedParagraph'

type Props = {
  work: Work
  onOpenKeyword: (wordId: string) => void
}

export function Reader({ work, onOpenKeyword }: Props) {
  return (
    <article className="rounded-xl border border-paper-deep bg-paper/90 px-5 py-8 shadow-sm sm:px-10 sm:py-10">
      <header className="mb-6 border-b border-paper-deep pb-5">
        {work.subtitle ? (
          <>
            <h2 className="font-read text-3xl font-normal tracking-normal text-ink sm:text-5xl">
              {work.subtitle}
            </h2>
            <p className="my-4 font-brand text-lg font-semibold tracking-tight text-ink-soft sm:text-xl">
              {work.title}
            </p>
          </>
        ) : (
          <h2 className="font-brand text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {work.title}
          </h2>
        )}
        <p className="mt-3 font-read text-sm text-ink-faint">
          Translation: {work.translator}
        </p>
      </header>

      <div className="font-read">
        {work.chapters.map((ch) => (
          <section
            key={ch.number}
            className="mb-12 scroll-mt-24 last:mb-0"
            id={`chapter-${ch.number}`}
          >
            <h3 className="mb-4 font-brand text-xl font-semibold text-ink-soft">
              Chapter {ch.number}
            </h3>
            <div className="text-ink">
              {ch.paragraphs.map((p, i) => (
                <AnnotatedParagraph
                  key={i}
                  paragraph={p}
                  work={work}
                  onOpenKeyword={onOpenKeyword}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-12 border-t border-paper-deep pt-8">
        <p className="font-read text-sm leading-relaxed text-ink-faint">
          Text and word studies are served from the catalog. Add or extend
          chapters and glossary entries in Supabase to update what appears here.
        </p>
      </footer>
    </article>
  )
}
