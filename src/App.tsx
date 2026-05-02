import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookGrid } from './components/BookGrid'
import { LibraryDrawer } from './components/LibraryDrawer'
import { MenuIcon } from './components/MenuIcon'
import { Reader } from './components/Reader'
import { StudyDrawer } from './components/StudyDrawer'
import { fetchWorkBySlug } from './lib/fetchWork'
import type { Work } from './types/reader'

const DEFAULT_WORK_SLUG = 'tao-te-ching'

export default function App() {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [activeBookId, setActiveBookId] = useState(DEFAULT_WORK_SLUG)
  const [activeWordId, setActiveWordId] = useState<string | null>(null)
  const [work, setWork] = useState<Work | null>(null)
  const [workError, setWorkError] = useState<string | null>(null)
  const [workLoading, setWorkLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setWorkLoading(true)
      setWorkError(null)
      try {
        const w = await fetchWorkBySlug(activeBookId)
        if (cancelled) return
        if (!w) {
          setWork(null)
          setWorkError(
            'This text is not in the database yet, or Supabase env vars are missing.',
          )
          return
        }
        setWork(w)
      } catch (e) {
        if (cancelled) return
        setWork(null)
        setWorkError(e instanceof Error ? e.message : 'Failed to load text.')
      } finally {
        if (!cancelled) setWorkLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [activeBookId])

  const study = useMemo(() => {
    if (!activeWordId || !work) return null
    return work.glossary[activeWordId] ?? null
  }, [activeWordId, work])

  const openKeyword = useCallback((wordId: string) => {
    setActiveWordId(wordId)
    setLibraryOpen(false)
  }, [])

  const closeStudy = useCallback(() => setActiveWordId(null), [])

  const selectBook = useCallback((id: string) => {
    setActiveBookId(id)
    setLibraryOpen(false)
  }, [])

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-paper-deep/80 via-paper to-paper">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-paper focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to text
        </a>

        <header className="shrink-0 border-b border-paper-deep/80 bg-paper/80 backdrop-blur-sm">
          <div className="flex w-full items-center gap-2 py-4 pr-5 sm:gap-3 sm:py-6 sm:pr-8">
            <button
              type="button"
              aria-expanded={libraryOpen}
              aria-controls="library-drawer"
              onClick={() => setLibraryOpen((o) => !o)}
              className="ml-8 flex h-10 w-10 shrink-0 items-center justify-center rounded-md pl-[env(safe-area-inset-left,0px)] text-ink transition hover:bg-paper-deep/60 hover:text-seal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
            >
              <span className="sr-only">
                {libraryOpen ? 'Close library menu' : 'Open library menu'}
              </span>
              <MenuIcon open={libraryOpen} className="shrink-0" />
            </button>
            <h1 className="ml-24 min-w-0 flex-1 font-read text-xl font-medium uppercase leading-tight tracking-[0.28em] text-seal sm:text-2xl lg:text-3xl">
              The Classic Reader
            </h1>
          </div>
        </header>

        <main
          id="main"
          className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-y-contain"
        >
          <div
            dir="ltr"
            className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12"
          >
            {workLoading ? (
              <p className="font-read text-ink-soft">Loading text…</p>
            ) : workError ? (
              <div
                className="rounded-lg border border-seal/30 bg-seal/[0.06] px-4 py-3 font-read text-sm text-ink"
                role="alert"
              >
                <p className="font-semibold">Could not load this work</p>
                <p className="mt-1 text-ink-soft">{workError}</p>
              </div>
            ) : work ? (
              <Reader work={work} onOpenKeyword={openKeyword} />
            ) : null}
          </div>
        </main>
      </div>

      <StudyDrawer
        open={Boolean(activeWordId && study)}
        study={study}
        onClose={closeStudy}
      />

      <LibraryDrawer
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title="Library"
      >
        <BookGrid
          activeId={activeBookId}
          onSelect={selectBook}
          singleColumn
        />
      </LibraryDrawer>
    </div>
  )
}
