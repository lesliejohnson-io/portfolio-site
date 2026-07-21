import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { WorkItem } from "@/lib/work";

const WORK_DIR = path.join(process.cwd(), "content", "work");

export function getCaseStudySlugs(): string[] {
  return fs
    .readdirSync(WORK_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getCaseStudy(
  slug: string
): { meta: WorkItem; content: string } | null {
  const file = path.join(WORK_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { meta: data as WorkItem, content };
}
