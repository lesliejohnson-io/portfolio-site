import fs from "fs";
import path from "path";
import { MDXRemote } from "next-mdx-remote/rsc";
import AboutPhoto from "@/components/mdx/AboutPhoto";
import WhatIBring from "@/components/WhatIBring";

const source = fs.readFileSync(
  path.join(process.cwd(), "content", "about.mdx"),
  "utf8"
);

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
      <div className="prose-about">
        <MDXRemote source={source} components={{ AboutPhoto, WhatIBring }} />
      </div>

      <footer className="mt-20 max-w-[68ch] border-t border-border pt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
          Colophon
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-fg-secondary">
          Built with Next.js and Tailwind CSS. Text is set in Newsreader,
          Source Sans 3, and JetBrains Mono. Designed and coded in conversation
          with Claude.
        </p>
      </footer>
    </article>
  );
}
