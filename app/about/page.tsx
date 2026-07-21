import fs from "fs";
import path from "path";
import { MDXRemote } from "next-mdx-remote/rsc";
import Pillars from "@/components/mdx/Pillars";
import AboutPhoto from "@/components/mdx/AboutPhoto";

const source = fs.readFileSync(
  path.join(process.cwd(), "content", "about.mdx"),
  "utf8"
);

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-[68ch] px-6 py-20 sm:py-24">
      <div className="prose-about">
        <MDXRemote source={source} components={{ Pillars, AboutPhoto }} />
      </div>

      <footer className="mt-20 border-t border-border pt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
          Colophon
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-fg-secondary">
          Built with Next.js and Tailwind CSS. Text is set in Newsreader,
          Source Sans 3, and JetBrains Mono. Case studies are authored in
          Markdown. The day/night toggle and the dot cursor were built from
          scratch. Designed and coded in conversation with Claude.
        </p>
      </footer>
    </article>
  );
}
