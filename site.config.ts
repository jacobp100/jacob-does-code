import path from "path";
import { Config } from "./core";
import Layout from "./components/Layout";

export default {
  pages: [
    "pages/**/*.mdx",
    "posts/**/*.mdx",
    "assets/technicalc/computation.tsx",
  ],
  urlForPage(filename) {
    const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})-/);

    let url = path.basename(filename, path.extname(filename));
    if (dateMatch != null) {
      url = url.replace(dateMatch[0], dateMatch[0].replace(/-/g, "/"));
    }

    return `/${url}`;
  },
  Layout,
  cssAnalyzer: true,
} as Config;
