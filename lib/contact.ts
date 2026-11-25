/*
  The contact address, in a plain (non-"use client") module so server and
  client components can both import it as a real string.
*/
export const CONTACT_EMAIL = "leslie@lesliejohnson.io";

/*
  The mailto for "write to me" affordances, with the subject prefilled so a
  message from the site is recognisable in the inbox before it is opened. The
  subject is encoded rather than written literally: spaces in a mailto query
  are not reliably handled by every mail client.
*/
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "From lesliejohnson.io site",
)}`;
