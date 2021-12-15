import * as path from "path";
// @ts-ignore
import glob from "glob";
// @ts-ignore
import projectPath from "./projectPath";

export type File = {
  url: string;
  filename: string;
  date: number | undefined;
};

const files: File[] = (
  glob.sync(path.join(projectPath, "**/*.mdx")) as string[]
)
  .map((filename): File => {
    const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})-/);

    let url = path.basename(filename, ".mdx");
    if (dateMatch != null) {
      url = url.replace(dateMatch[0], dateMatch[0].replace(/-/g, "/"));
    }

    return {
      url,
      filename: "/" + path.relative(projectPath, filename),
      date:
        dateMatch != null
          ? Date.UTC(+dateMatch[1], +dateMatch[2] - 1, +dateMatch[3])
          : undefined,
    };
  })
  .sort((a, b) => {
    if (a.date != null && b.date != null) {
      return b.date - a.date;
    } else {
      return Infinity;
    }
  });

export const getFiles = () => files;
