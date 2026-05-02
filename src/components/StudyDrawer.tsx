import { useEffect, useId } from 'react'
import type { WordStudy } from '../types/reader'

type Props = {
  open: boolean
  study: WordStudy | null
  onClose: () => void
}

/**
 * Inline right column: expands in the document flow so main content stays
 * visible and interactive (no modal veil).
 */
export function StudyDrawer({ open, study, onClose }: Props) {
  const titleId = useId()
  const show = Boolean(open && study)

  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [show, onClose])

  return (
    <aside
      aria-hidden={!show}
      aria-labelledby={show ? titleId : undefined}
      role="region"
      className={[
        'relative h-full min-h-0 shrink-0 border-paper-deep bg-paper transition-[width] duration-200 ease-out',
        show
          ? 'z-40 w-[min(36rem,42vw)] overflow-y-auto overscroll-y-contain border-l'
          : 'z-0 w-0 overflow-hidden border-0',
      ].join(' ')}
    >
      {show && study ? (
        <div>
          <header className="flex items-start justify-between gap-4 border-b border-paper-deep px-6 py-5">
            <div className="min-w-0 flex-1 pr-2">
              <p
                id={titleId}
                className="mt-16 font-brand text-2xl font-semibold tracking-tight text-ink"
              >
                {study.hanzi ? (
                  <span className="mr-2 font-read text-3xl">{study.hanzi}</span>
                ) : null}
                <span className="text-ink-soft">{study.label}</span>
              </p>
              {study.pinyin ? (
                <p className="mt-1 font-read text-sm tracking-wide text-ink-faint">
                  {study.pinyin}
                </p>
              ) : null}
              <p className="mt-3 font-read text-base leading-snug text-ink-soft">
                {study.tagline}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 self-start rounded-md border border-paper-deep bg-paper-deep/40 px-2.5 py-1.5 font-read text-sm text-ink-soft transition hover:border-seal/40 hover:text-ink"
            >
              Close
            </button>
          </header>

          <div className="px-6 py-6">
            <div className="space-y-4 font-read text-[0.98rem] leading-relaxed text-ink-soft">
              {study.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {study.alternateTranslations.length > 0 ? (
              <section className="mt-8 border-t border-paper-deep pt-6">
                <h3 className="font-brand text-sm font-semibold uppercase tracking-[0.12em] text-seal">
                  Other English glosses
                </h3>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 font-read text-[0.95rem] text-ink-soft">
                  {study.alternateTranslations.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="mt-10 font-read text-xs leading-relaxed text-ink-faint">
              Future versions will link each term to a full wiki page: other
              appearances, related characters, and editions — powered by the
              catalog backend.
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
