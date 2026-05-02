import type { BookListItem } from '../types/reader'

const books: BookListItem[] = [
  {
    id: 'tao-te-ching',
    title: 'Tao Te Ching',
    author: 'Trad. Laozi',
    written: 'c. 4th century BCE',
    originalTitle: '道德經',
    available: true,
  },
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    written: 'c. 170–180 CE',
    originalTitle: 'Τὰ εἰς ἑαυτόν',
    available: false,
  },
  {
    id: 'zhuangzi',
    title: 'Zhuangzi',
    author: 'Trad. Zhuang Zhou',
    written: '4th century BCE',
    originalTitle: '莊子',
    available: false,
  },
  {
    id: 'analects',
    title: 'Analects',
    author: 'Attributed to Confucius (compiled by disciples)',
    written: '5th–3rd century BCE',
    originalTitle: '論語',
    available: false,
  },
]

type Props = {
  activeId: string
  onSelect: (id: string) => void
  /** Single column (e.g. narrow library drawer). */
  singleColumn?: boolean
}

export function BookGrid({ activeId, onSelect, singleColumn }: Props) {
  return (
    <div
      className={
        singleColumn ? 'grid grid-cols-1 gap-3' : 'grid gap-3 sm:grid-cols-2'
      }
    >
      {books.map((b) => {
        const active = b.id === activeId
        const disabled = !b.available
        return (
          <button
            key={b.id}
            type="button"
            disabled={disabled}
            onClick={() => (b.available ? onSelect(b.id) : undefined)}
            className={[
              'rounded-lg border px-4 py-4 text-left transition',
              disabled
                ? 'cursor-not-allowed border-paper-deep/80 bg-paper-deep/25 opacity-70'
                : active
                  ? 'border-seal/50 bg-seal/[0.07] shadow-sm'
                  : 'border-paper-deep bg-paper hover:border-seal/35 hover:bg-seal/[0.04]',
            ].join(' ')}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-brand text-lg font-semibold text-ink">
                {b.title}
              </h3>
              {disabled ? (
                <span className="shrink-0 rounded-full bg-paper-deep px-2 py-0.5 font-read text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                  Soon
                </span>
              ) : null}
            </div>
            <div className="mt-3 space-y-1 font-read text-sm leading-snug text-ink-soft">
              <p>{b.author}</p>
              <p className="text-ink-faint">{b.written}</p>
              <p className="text-[0.95rem] text-ink">{b.originalTitle}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
