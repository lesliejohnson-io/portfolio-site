/*
  The contact address, in a plain module rather than in useCopyEmail. That file
  is "use client", so a server component importing from it gets a client
  reference proxy instead of the string — fine inside a client component, but
  it renders as a broken href on a server-rendered page.
*/
export const CONTACT_EMAIL = "leslie@lesliejohnson.io";

/*
  The mailto for "write to me" affordances, with the subject prefilled so a
  message from the site is recognisable in the inbox before it is opened. The
  subject is encoded rather than written literally: spaces in a mailto query
  are not reliably handled by every mail client.
*/
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "From your portfolio site",
)}`;
