import MailtoLink from "@/components/MailtoLink";
import { GitHubIcon, LinkedInIcon } from "@/components/SocialIcons";

/*
  The site footer: a dark band in both themes. Colophon on the left,
  copyright centred, three icon links on the right. It stacks on phones.

  Each icon link has an aria-label, because an icon alone has no name for a
  screen reader to announce. The two that open new tabs say so.
*/
export default function Footer() {
  const year = new Date().getFullYear();
  const icon =
    "flex items-center justify-center rounded-full p-2 text-hero-field-subline transition-colors hover:text-hero-field-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-field-label";

  return (
    <footer className="bg-footer-bg">
      {/* The three-column layout lives in globals.css (.footer-row). */}
      <div className="footer-row container-wide py-10 text-sm text-hero-field-subline">
        <p className="footer-colophon">Built with Next.js, React, Three.js and Tailwind CSS.</p>
        <p className="footer-copyright">&copy; {year} Leslie Johnson. All rights reserved.</p>

        <div className="footer-icons">
          <div className="-mx-2 flex items-center gap-1">
            <a
              href="https://github.com/lesliejohnson-io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (opens in a new tab)"
              className={icon}
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/lesliejohnson-ux"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn (opens in a new tab)"
              className={icon}
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
            <MailtoLink location="footer" aria-label="Email Leslie" className={icon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </MailtoLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
