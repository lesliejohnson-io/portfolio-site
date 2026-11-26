import MailtoLink from "@/components/MailtoLink";

/**
 * The nav's Contact link. It opens a new email with the site's subject line
 * already filled in, like every other mail link on the site, and fires
 * `email_click` tagged location: "nav" so it can be told apart in GA4.
 *
 * It used to copy the address and show an "Email copied!" toast instead.
 *
 * An outlined button rather than a plain link, so the one action in the nav
 * stands apart from the page links beside it. Same treatment as the hero's
 * "Let’s talk" button: an outline in the accent colour that fills on hover.
 * It keeps the nav's small uppercase type so it sits on the same line as
 * the links. No link-draw underline: the border already says "clickable",
 * and an underline inside a box reads as two affordances at once.
 *
 * Coloured with --accent rather than the hero's fixed --hero-field-cta,
 * because this component also renders in the phone menu, whose panel is
 * near-white on the light theme. Inside the dark nav (.theme-dark) --accent
 * IS the hero button's blue; on a light panel it is the darker blue that
 * passes AA on white.
 */
export default function NavContact() {
  return (
    <MailtoLink
      location="nav"
      className="block rounded-md border border-accent px-3.5 py-1.5 font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-accent transition-colors hover:bg-accent hover:text-accent-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      Contact
    </MailtoLink>
  );
}
