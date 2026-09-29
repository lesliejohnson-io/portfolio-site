import React from "react";

/**
 * The case study content files (e.g. content/work/ecsi.mdx) are authored in
 * plain markdown and must not be rewritten — the Natoli-structure components
 * below are mapped onto the markdown conventions already used in the files:
 *
 *   > **PROJECT SUMMARY** …            → ProjectSummary
 *   > **84%** — caption                → StatCallout (one or more stat rows)
 *   > **Name — Role** *(representative composite …)* … → PersonaCard
 *   > **Before:** … / **After:** …     → BeforeAfter
 *   *[Visual: …]*                       → VisualSlot placeholder
 *
 * remark-breaks turns soft line breaks inside a blockquote into <br>, so
 * extractText() can recover the authored line structure as "\n" and the
 * components re-present it. Every word stays exactly as written; only the
 * markup around it changes.
 */

export function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    if (el.type === "br") return "\n";
    return extractText(el.props.children);
  }
  return "";
}

function paragraphTexts(children: React.ReactNode): string[] {
  return React.Children.toArray(children)
    .filter((c) => React.isValidElement(c))
    .map((c) => extractText(c).trim())
    .filter(Boolean);
}

function ProjectSummary({ children }: { children: React.ReactNode }) {
  const full = extractText(children).trim();
  const body = full.replace(/^PROJECT SUMMARY\s*/i, "").trim();
  return (
    <aside className="my-10">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-accent">
        Project Summary
      </p>
      <p className="mt-3 font-serif text-xl leading-relaxed text-fg">{body}</p>
    </aside>
  );
}

function StatCallout({ paragraphs }: { paragraphs: string[] }) {
  const stats = paragraphs.map((p) => {
    const match = p.match(/^([\d.,]+%?)\s+—\s+([\s\S]+)$/);
    return match
      ? { value: match[1], caption: match[2] }
      : { value: p, caption: "" };
  });

  return (
    <div className="stat-reveal my-10 grid gap-6 sm:grid-cols-2">
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-bg-raised p-6"
        >
          <div className="font-serif text-5xl leading-none text-fg">
            {s.value}
          </div>
          {s.caption && (
            <p className="mt-4 font-mono text-xs leading-relaxed text-fg-secondary">
              {s.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function PersonaCard({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const [headline, ...rest] = lines;
  const parenIndex = headline.indexOf("(");
  const name =
    parenIndex >= 0 ? headline.slice(0, parenIndex).trim() : headline;
  const label =
    parenIndex >= 0
      ? headline.slice(parenIndex).replace(/^\(|\)$/g, "").trim()
      : "";

  return (
    <aside className="my-10 rounded-lg border border-border-strong bg-surface p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-serif text-lg text-fg">{name}</span>
        {label && (
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-fg-muted">
            {label}
          </span>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {rest.map((line, i) => {
          const inEffect = /^in effect/i.test(line);
          return (
            <p
              key={i}
              className={`text-sm leading-relaxed ${
                inEffect ? "italic text-fg" : "text-fg-secondary"
              }`}
            >
              {line}
            </p>
          );
        })}
      </div>
    </aside>
  );
}

function BeforeAfter({ text }: { text: string }) {
  const rows = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      return {
        label: line.slice(0, idx).trim(),
        value: line.slice(idx + 1).trim(),
      };
    });

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-border">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex flex-col gap-1 p-5 sm:flex-row sm:gap-6 ${
            i > 0 ? "border-t border-border" : ""
          } ${i === 0 ? "bg-surface" : "bg-bg-raised"}`}
        >
          <span className="w-20 shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-fg-muted">
            {row.label}
          </span>
          <span className="text-sm leading-relaxed text-fg-secondary">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Routes an authored blockquote to the right Natoli component based on the
 * conventions above. Order matters: PersonaCard and BeforeAfter are checked
 * before StatCallout because their captions can also contain " — ".
 */
export function CaseStudyBlockquote({
  children,
}: {
  children: React.ReactNode;
}) {
  const full = extractText(children).trim();
  const paragraphs = paragraphTexts(children);

  if (/^PROJECT SUMMARY\b/i.test(full)) {
    return <ProjectSummary>{children}</ProjectSummary>;
  }
  if (/representative composite/i.test(full)) {
    return <PersonaCard text={full} />;
  }
  if (/^Before:/i.test(full)) {
    return <BeforeAfter text={full} />;
  }
  const looksLikeStats =
    paragraphs.length > 0 &&
    paragraphs.every((p) => /^[\d.,]+%?\s+—\s+/.test(p));
  if (looksLikeStats) {
    return <StatCallout paragraphs={paragraphs} />;
  }

  return (
    <blockquote className="my-6 border-l-2 border-border-strong pl-5 text-fg-secondary italic">
      {children}
    </blockquote>
  );
}
