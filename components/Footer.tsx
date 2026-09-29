import Link from "next/link";
import EmailAffordance from "@/components/EmailAffordance";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container-wide flex flex-col gap-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="font-display text-base font-medium text-fg">
              Leslie Johnson
            </Link>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.06em] text-fg-muted">
              Intelligent Systems Meet Human Design
            </p>
          </div>

          <div className="flex items-center gap-5 font-mono text-xs uppercase tracking-[0.06em] text-fg-secondary">
            <a
              href="https://linkedin.com/in/lesliejohnsonn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/lesliejohnson-io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              GitHub
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
