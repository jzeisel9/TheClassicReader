type Props = {
  open: boolean
  className?: string
}

/** Simple hamburger / close icon for the library control. */
export function MenuIcon({ open, className = '' }: Props) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path
            d="M4 4l14 14M18 4L4 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M4 6.5h14M4 11h14M4 15.5h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}
