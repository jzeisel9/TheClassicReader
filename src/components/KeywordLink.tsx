type Props = {
  children: string
  wordId: string
  hint?: string
  onOpen: (wordId: string) => void
}

export function KeywordLink({ children, wordId, hint, onOpen }: Props) {
  return (
    <button
      type="button"
      title={hint}
      onClick={() => onOpen(wordId)}
      className="keyword-link cursor-pointer border-b border-dotted border-seal/55 bg-seal/[0.06] px-0.5 text-ink underline-offset-2 transition hover:border-seal hover:bg-seal/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
    >
      {children}
    </button>
  )
}
