import EmailAffordance from "@/components/EmailAffordance";
import { GitHubIcon, LinkedInIcon } from "@/components/SocialIcons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface">
      <div className="container-wide flex flex-col gap-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.06em] text-fg-muted">
              Intelligent Systems Meet{" "}
              <span className="text-accent">Human Design</span>
            </p>
          </div>

          <div className="flex items-center gap-1 text-fg-secondary">
            <a
              href="https://linkedin.com/in/lesliejohnsonn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn (opens in a new tab)"
              className="rounded-full p-2 transition-colors hover:text-accent"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/lesliejohnson-io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (opens in a new tab)"
              className="rounded-full p-2 transition-colors hover:text-accent"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
            <EmailAffordance />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6 font-mono text-[11px] text-fg-muted">
          <span>&copy; {year} Leslie Johnson</span>
          <span>Built with Next.js and Tailwind CSS. Designed and coded in conversation with Claude.</span>
        </div>
      </div>
    </footer>
  );
}
