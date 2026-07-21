import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type WorkItem = {
  slug: string;
  order: number;
  name: string;
  tag: string;
  title: string;
  who: string;
  what: string;
  result: string;
};

const WORK_DIR = path.join(process.cwd(), "content", "work");

export function getWorkItems(): WorkItem[] {
  const files = fs.readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx"));

  const items = files.map((file) => {
    const raw = fs.readFileSync(path.join(WORK_DIR, file), "utf8");
    const { data } = matter(raw);
    return data as WorkItem;
  });

  return items.sort((a, b) => a.order - b.order);
}
