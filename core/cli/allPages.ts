import glob from "glob";
import path from "path";
import { cwd } from "process";
import type { Config } from "../config";
import type { Page } from "../usePages";
import castArray from "../util/castArray";

const projectPath = cwd();

let config: Config;
try {
  config = require(path.join(projectPath, "site.config.ts")).default;
} catch {
  config = {};
}

const pageFilenames = new Set(
  castArray(config.pages ?? "**/*.mdx").flatMap((fileGlob) => {
    return glob.sync(fileGlob, { cwd: projectPath });
  })
);

export default new Set(
  Array.from(pageFilenames, (absolutePath): Page => {
    const filename = "/" + path.relative(projectPath, absolutePath);
    const url =
      config.urlForPage?.(filename) ?? path.basename(filename, ".mdx");
    return { filename, url };
  })
);
