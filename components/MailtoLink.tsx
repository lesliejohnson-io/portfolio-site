"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { CONTACT_MAILTO } from "@/lib/contact";

/**
 * A link that opens a new email to Leslie with the site's subject line, and
 * records an `email_click` event tagged with where it was clicked.
 *
 * A client component only because of the onClick; the pages it sits in can
 * stay server components. No preventDefault: the event is sent and the mail
 * client opens as normal, so a slow analytics call can never eat the click.
 */
export default function MailtoLink({
  location,
  className,
  children,
  ...rest
}: {
  location: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  return (
    <a
      href={CONTACT_MAILTO}
      onClick={() => sendGAEvent("event", "email_click", { location })}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}
