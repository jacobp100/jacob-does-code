import * as fs from "fs";
import * as path from "path";
// @ts-ignore
import glob from "glob";
// @ts-ignore
import frontmatter from "frontmatter";

const name = (filename: string) =>
  path.basename(filename, path.extname(filename));

const title = (filename: string): string | undefined => {
  const content = fs.readFileSync(filename, "utf8");
  const { data } = frontmatter(content);
  return data.title;
};

type File = {
  url: string;
  title: string | undefined;
  filename: string;
  date: number | undefined;
};

export const pages: File[] = (glob.sync(
  path.join(__dirname, "../pages/*.md")
) as string[]).map(
  (filename): File => ({
    url: name(filename),
    title: title(filename),
    filename,
    date: undefined,
  })
);

export const posts: File[] = (glob.sync(
  path.join(__dirname, "../posts/*.md")
) as string[])
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
