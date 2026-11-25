/*
  Shared by Nav (desktop) and MobileNav (the slide-in panel). Kept here
  rather than in Nav.tsx so the client-side MobileNav doesn't import the
  component that renders it.
*/
export type NavLink = { href: string; label: string; external?: boolean };

/*
  A nav link that leaves the site opens in a new tab. The visible label stays
  as is; each component adds a hidden "(opens in a new tab)" for screen
  readers.
*/
export const externalProps = { target: "_blank", rel: "noopener noreferrer" } as const;
