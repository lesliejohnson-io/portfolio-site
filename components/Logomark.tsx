/**
 * The node-graph mark, same artwork as the favicon (app/icon.svg).
 *
 * Inlined rather than loaded as an <img> so the shapes can use currentColor:
 * the file version colors itself with a `prefers-color-scheme` media query,
 * which follows the operating system, but this site's theme is driven by the
 * toggle (data-theme on <html>). An <img> would show the wrong color whenever
 * someone toggles against their OS setting. Inheriting currentColor also means
 * the mark picks up the nav link's hover color for free.
 *
 * Decorative: the adjacent "Leslie Johnson" text is the accessible name, so
 * this is hidden from assistive tech.
 */
export default function Logomark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 185 166"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g clipPath="url(#logomark-clip)">
        <circle cx="99.5" cy="74.5" r="29.5" />
        <circle cx="35" cy="39" r="15" />
        <circle cx="15" cy="151" r="15" />
        <circle cx="100" cy="143" r="15" />
        <circle cx="165" cy="104" r="15" />
        <circle cx="170" cy="15" r="15" />
        <rect x="95" y="98" width="7" height="42" />
        <rect
          x="117"
          y="85.2743"
          width="7"
          height="42"
          transform="rotate(-63.6801 117 85.2743)"
        />
        <rect
          x="44.1948"
          y="46.6647"
          width="7"
          height="42"
          transform="rotate(-61.9577 44.1948 46.6647)"
        />
        <rect
          x="121.271"
          y="60.1705"
          width="7"
          height="66.1045"
          transform="rotate(-127.597 121.271 60.1705)"
        />
        <rect
          x="18.0439"
          y="153.124"
          width="7"
          height="91.2745"
          transform="rotate(-132.884 18.0439 153.124)"
        />
      </g>
      <defs>
        <clipPath id="logomark-clip">
          <rect width="185" height="166" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
