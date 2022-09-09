import glob from "glob";
import path from "path";
import type { Config, Page } from "../config";
import { projectPath } from "../config";
import castArray from "../util/castArray";
import "./register";

export default ({ pages, urlForPage }: Config): Page[] => {
  const pageFilenames = new Set(
    castArray(pages).flatMap((fileGlob) => {
      return glob.sync(fileGlob, { cwd: projectPath });
    })
  );

  return Array.from(pageFilenames, (absolutePath): Page => {
    const filename = "/" + path.relative(projectPath, absolutePath);
    const extname = path.extname(absolutePath);
    const url = urlForPage?.(filename) ?? filename.slice(0, -extname.length);

    if (!url.startsWith("/")) {
      throw new Error("Page urls must start with a `/`");
    }

    return { filename, url };
  });
};
