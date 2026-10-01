import fs from "fs";
import path from "path";
import { MDXRemote } from "next-mdx-remote/rsc";
import AboutPhoto from "@/components/mdx/AboutPhoto";
import WhatIBring from "@/components/WhatIBring";

export default function AboutPage() {
  /*
    Read per render, not at module scope. A module-scope read is cached by the
    dev server — the .mdx isn't an import, so editing it doesn't invalidate the
    module and changes silently don't appear. Static generation still runs this
    once at build.
  */
  const source = fs.readFileSync(
    path.join(process.cwd(), "content", "about.mdx"),
    "utf8"
  );

  return (
    <article className="container-wide py-20 sm:py-24">
      <div className="prose-about">
        <MDXRemote source={source} components={{ AboutPhoto, WhatIBring }} />
      </div>
    </article>
  );
}
