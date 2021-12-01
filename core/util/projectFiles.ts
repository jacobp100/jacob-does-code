import * as fs from "fs";
import * as path from "path";
// @ts-ignore
import glob from "glob";
// @ts-ignore
import frontmatter from "frontmatter";
import projectPath from "./projectPath.js";

const name = (filename: string) =>
  path.basename(filename, path.extname(filename));

const title = (filename: string): string | null => {
  const content = fs.readFileSync(filename, "utf8");
  const { data } = frontmatter(content);
  return data.title ?? null;
};

export type File = {
  url: string;
  title: string | null;
  filename: string;
  date: number | null;
};

const pages: File[] = (
  glob.sync(path.join(projectPath, "pages/*.mdx")) as string[]
).map(
  (filename): File => ({
    url: name(filename),
    title: title(filename),
    filename,
    date: null,
  })
);

const posts: File[] = (
  glob.sync(path.join(projectPath, "posts/*.mdx")) as string[]
)
  .map(
    (filename): File => ({
      url: name(filename).replace(
        /^(\d{4})-(\d{2})-(\d{2})-(.*)$/,
        "$1/$2/$3/$4"
      ),
      title: title(filename),
      filename,
      date: Date.parse(filename.match(/(\d{4}-\d{2}-\d{2})/)![1]),
    })
  )
  .sort((a, b) => (b.date ?? 0) - (a.date ?? 0));

export const getPages = () => pages;
export const getPosts = () => posts;
