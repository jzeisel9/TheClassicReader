import { useEffect, useId, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function LibraryDrawer({ open, onClose, title, children }: Props) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-start"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close library"
        className="absolute inset-0 bg-veil backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <aside
        id="library-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-full max-h-full w-full max-w-md flex-col border-r border-paper-deep bg-paper shadow-[24px_0_48px_rgba(26,23,20,0.12)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-paper-deep px-5 py-4 sm:px-6">
          <h2
            id={titleId}
            className="font-brand text-xl font-semibold tracking-tight text-ink"
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-paper-deep bg-paper-deep/40 px-2.5 py-1.5 font-read text-sm text-ink-soft transition hover:border-seal/40 hover:text-ink"
          >
            Close
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </aside>
    </div>
  )
}
