import * as path from "path";
import glob from "glob";
import projectPath from "./projectPath";

export type Page = {
  url: string;
  filename: string;
  date: number | undefined;
};

const pages: Page[] = glob
  .sync("**/*.mdx", {
    cwd: projectPath,
    ignore: ["node_modules"],
  })
  .map((filename): Page => {
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

export const getPages = () => pages;
