import {
  CALIBRATE_PATTERNS,
  CALIBRATE_URL,
  patternUrl,
  type CalibrateIcon,
} from "@/lib/calibrate";

/**
 * The Calibrate section: a left-aligned intro (eyebrow, mark and name, two
 * lines of description), then a grid of pattern cards (one column on
 * phones, two on tablets, three on desktop).
 *
 * Each card's dark tile carries a small line drawing of the pattern. They
 * are inline SVG in `currentColor`, so one token (--pattern-ink) colours all
 * of them and they stay crisp at any size.
 *
 * `scroll-mt-20` keeps the heading clear of the sticky nav when the nav's
 * "Calibrate" link jumps here.
 */
export default function CalibrateSection() {
  return (
    <section
      id="calibrate"
      aria-labelledby="calibrate-title"
      className="scroll-mt-20 bg-surface py-20 sm:py-24"
    >
      <div className="container-wide">
        {/*
          Left-aligned, in the same 1100px column as the grid below, so the
          eyebrow, heading and first card share one left edge.
        */}
        <header className="mx-auto flex max-w-[1100px] flex-col items-start gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Pattern library · 2026
          </p>
          {/* The mark sits to the left of the name, like a logo lockup. */}
          <div className="flex items-center gap-3">
            <CalibrateMark className="h-9 w-11 shrink-0 text-fg" />
            <h2
              id="calibrate-title"
              className="font-display text-[clamp(28px,3vw,38px)] font-bold leading-tight tracking-[-0.02em] text-fg"
            >
              {/* The heading links out to the Calibrate site. */}
              <a
                href={CALIBRATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Calibrate
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </h2>
          </div>
          {/*
            The ● and ■ are the site's shorthand for human and machine (the
            same shapes as the pattern drawings). Each "(●)" is hidden from
            screen readers, which would otherwise announce "left paren, black
            circle, right paren" mid-sentence.
          */}
          <div className="mt-2 max-w-[46rem] text-[17px] leading-snug text-fg">
            <p>
              {/*
                The arrow is drawn at 0.8em so it reads as a small connector,
                not a word. Screen readers hear "human–machine trust": the
                arrow itself is hidden (it would be announced as "right
                arrow") and a hidden dash stands in for it.
              */}
              Design patterns for human<span aria-hidden="true"> (●)</span>{" "}
              <span aria-hidden="true" className="text-[0.8em]">
                →
              </span>
              <span className="sr-only">–</span> machine
              <span aria-hidden="true"> (■)</span> trust.
            </p>
            <p>
              Each pattern begins with a failure incident, names the
              anti-pattern, and gives a structure that works differently in a
              cockpit than in a warehouse. These are blueprints, not components.
            </p>
          </div>
        </header>

        <ul className="mx-auto mt-12 grid max-w-[1100px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {CALIBRATE_PATTERNS.map((pattern) => (
            <li key={pattern.title}>
              {/*
                The whole card is one link: there is a single destination and
                no other control inside it, so wrapping is simpler than the
                stretched-link pattern the work rows need.
              */}
              <a
                href={patternUrl(pattern.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-bg-raised transition-colors hover:border-border-strong"
              >
                {/*
                  The tile runs edge to edge across the top of the card. It has
                  no rounding of its own: the card's overflow-hidden clips its
                  top corners to the card's curve, and its bottom edge stays
                  square where it meets the text.
                */}
                <div className="flex h-30 items-center justify-center bg-pattern-tile text-pattern-ink">
                  <PatternIcon name={pattern.icon} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg font-bold tracking-[-0.01em] text-fg">
                    {pattern.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-fg-secondary">
                    {pattern.description}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-accent">
                    Read the pattern
                    <span className="sr-only"> (opens in a new tab)</span>
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                    >
                      →
                    </span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** A disc balanced on a beam over a fulcrum: calibration, as a mark. */
function CalibrateMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 40"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <circle cx="24" cy="10" r="9" />
      <rect x="2" y="21" width="44" height="5" />
      <polygon points="24,27 30,38 18,38" />
    </svg>
  );
}

/*
  The six pattern drawings. Each is drawn on the same 120x48 box so they sit
  at one scale across the grid.
*/
function PatternIcon({ name }: { name: CalibrateIcon }) {
  const common = {
    viewBox: "0 0 120 48",
    className: "h-12 w-[120px]",
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
  } as const;

  switch (name) {
    // A cube with its hidden edges dotted: the inside made visible.
    case "glass-box":
      return (
        <svg {...common}>
          <path d="M60 4 L79 14 V35 L60 45 L41 35 V14 Z" />
          <path d="M41 14 L60 24 L79 14" strokeDasharray="1.5 2.5" />
          <path d="M60 24 V45" strokeDasharray="1.5 2.5" />
          <path d="M60 4 V24" strokeDasharray="1.5 2.5" />
        </svg>
      );
    // Two shapes overlapping: one picture held by both.
    case "shared-model":
      return (
        <svg {...common}>
          <rect
            x="58"
            y="10"
            width="26"
            height="28"
            fill="currentColor"
            opacity="0.75"
            stroke="none"
          />
          <circle cx="54" cy="24" r="14" fill="currentColor" stroke="none" />
        </svg>
      );
    // A flagged line on top of a stack: the urgent one first.
    case "alert-triage":
      return (
        <svg {...common}>
          <polygon points="40,5 45,8 40,11" fill="currentColor" stroke="none" />
          <path d="M50 8 H80" strokeWidth="2" />
          <path d="M47 15 H80 M47 20 H80 M47 25 H80 M47 30 H80 M47 35 H80 M47 40 H80" />
        </svg>
      );
    // An action stopped at a barrier before it reaches the target.
    case "friction":
      return (
        <svg {...common}>
          <circle cx="30" cy="24" r="8" fill="currentColor" stroke="none" />
          <path d="M44 24 H62" />
          <polygon
            points="62,21.5 66,24 62,26.5"
            fill="currentColor"
            stroke="none"
          />
          <path d="M72 9 V39" strokeWidth="2" />
          <rect x="82" y="16" width="16" height="16" />
        </svg>
      );
    // The steps of a plan laid out between where it starts and where it lands.
    case "intent-preview":
      return (
        <svg {...common}>
          <rect
            x="16"
            y="15"
            width="18"
            height="18"
            fill="currentColor"
            stroke="none"
          />
          <path d="M34 24 H42 M42 19 V29 M42 19 H44 M42 29 H44" />
          <polygon
            points="50,20 54,24 50,28 46,24"
            fill="currentColor"
            stroke="none"
          />
          <circle cx="60" cy="24" r="3.5" />
          <circle cx="70" cy="24" r="3.5" fill="currentColor" stroke="none" />
          <path d="M78 19 V29 M78 19 H76 M78 29 H76 M78 24 H90" />
          <polygon
            points="88,21.5 92,24 88,26.5"
            fill="currentColor"
            stroke="none"
          />
          <rect x="94" y="15" width="18" height="18" />
        </svg>
      );
    // A request turned back at the edge of a dotted boundary.
    case "capability":
      return (
        <svg {...common}>
          <circle cx="40" cy="24" r="5" fill="currentColor" stroke="none" />
          <path d="M52 24 H66" />
          <polygon
            points="52,21.5 48,24 52,26.5"
            fill="currentColor"
            stroke="none"
          />
          <path d="M66 18 V30" strokeWidth="1.5" />
          <rect x="66" y="8" width="30" height="32" strokeDasharray="1.5 2" />
          <rect
            x="75"
            y="18"
            width="12"
            height="12"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
  }
}
