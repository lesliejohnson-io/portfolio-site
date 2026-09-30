/**
 * Wraps a rebuilt CodePen demo as a card in the Working Library flow, with a
 * square badge in the lower right linking out to the original pen.
 *
 * The badge is the credit as much as the affordance: these are rebuilds of
 * other people's work, so every one of them points back at its source.
 */
export default function DemoCard({
  children,
  href,
  label,
  caption,
  span = false,
}: {
  children: React.ReactNode;
  /**
   * The source this was rebuilt from. Omit it for original work — the badge
   * exists to credit someone else, so there is nothing to point at.
   */
  href?: string;
  /** Source title and author, for the link's accessible name. */
  label?: string;
  /** Short name shown in the lower left, over the artwork. */
  caption?: string;
  /** Break out of the column flow and run two columns wide. */
  span?: boolean;
}) {
  return (
    <div className={`mb-4 break-inside-avoid ${span ? "demo-span" : ""}`}>
      <div className="relative overflow-hidden rounded-md">
        {children}

        {caption && (
          <span
            aria-hidden="true"
            className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.08em] text-white/55"
          >
            {caption}
          </span>
        )}

        {href && label && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded border border-white/25 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span className="sr-only">{label} (opens in a new tab)</span>
            <svg
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-3.5 w-3.5"
            >
              <path d="M3.5 8.5 8.5 3.5" />
              <path d="M4.25 3.5H8.5V7.75" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
