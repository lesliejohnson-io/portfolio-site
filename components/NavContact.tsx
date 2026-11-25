import MailtoLink from "@/components/MailtoLink";

/**
 * The nav's Contact link. It opens a new email with the site's subject line
 * already filled in, like every other mail link on the site, and fires
 * `email_click` tagged location: "nav" so it can be told apart in GA4.
 *
 * It used to copy the address and show an "Email copied!" toast instead.
 */
export default function NavContact() {
  return (
    <MailtoLink
      location="nav"
      className="link-draw block font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-fg-secondary transition-colors hover:text-fg"
    >
      Contact
    </MailtoLink>
  );
}
