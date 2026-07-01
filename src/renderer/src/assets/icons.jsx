export const Icons = {
  sidebar: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  ),
  addBook: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  folder: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M1.75 2.917h3.5L6.417 4.5h5.833a.583.583 0 0 1 .583.583v5.834a.583.583 0 0 1-.583.583H1.75a.583.583 0 0 1-.583-.583V3.5a.583.583 0 0 1 .583-.583Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  minimize: (
    <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
      <rect width="10" height="1" fill="currentColor" />
    </svg>
  ),
  maximize: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  close: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  emptyLibrary: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="6" width="20" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="10" width="20" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x="20"
        y="14"
        width="20"
        height="28"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--bg-secondary)"
      />
      <path d="M26 24h8M26 28h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  noResults: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="1.5" />
      <path d="M28 28l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
