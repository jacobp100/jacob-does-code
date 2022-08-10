import path from "path";
import { Config } from "./core/core";

export default {
  pages: ["pages/**/*.mdx", "posts/**/*.mdx"],
  urlForPage(filename) {
    const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})-/);

    let url = path.basename(filename, ".mdx");
    if (dateMatch != null) {
      url = url.replace(dateMatch[0], dateMatch[0].replace(/-/g, "/"));
    }

    return url;
  },
} as Config;
