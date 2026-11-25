import Link from "next/link"

/*
  The site mark: a circle and a square, drawn as SVG so it stays crisp at any
  size. In the nav it is one flat colour, the theme's foreground (see
  `.logo-mark-circle` in globals.css), with no grey tile. The green, lavender
  and grey version appears only in the favicon and app icons (app/icon.svg etc.).
*/

type Props = {
  size?: number          // rendered width in px; the mark is twice as wide as it is tall
  href?: string
  name?: string | null   // set to null to show the mark alone
}

export default function LogoMark({ size = 40, href = "/", name = "Leslie Johnson" }: Props) {
  return (
    <Link
      href={href}
      aria-label={name ? undefined : "Leslie Johnson, home"}
      className="logo-mark"
      style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}
    >
      <svg
        width={size}
        height={size / 2}
        viewBox="0 0 48 24"
        style={{ display: "block" }}
        aria-hidden="true"
        focusable="false"
      >
        <circle className="logo-mark-circle" cx="11.5" cy="12" r="11.5" />
        <rect className="logo-mark-square" x="25" y="0.5" width="23" height="23" />
      </svg>
      {name && (
        <span
          className="logo-mark-name"
          style={{ fontFamily: "var(--font-archivo, Archivo), system-ui, sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em", lineHeight: 1 }}
        >
          {/* First name at 600, last name at 800 */}
          {name.includes(" ") ? (
            <>
              {name.slice(0, name.lastIndexOf(" ") + 1)}
              <span style={{ fontWeight: 800 }}>{name.slice(name.lastIndexOf(" ") + 1)}</span>
            </>
          ) : name}
        </span>
      )}
    </Link>
  )
}
