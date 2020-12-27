import * as fs from "fs";
import { renderToStaticMarkup } from "react-dom/server";
// @ts-ignore
import frontmatter from "frontmatter";
import type { File } from "./files";
import { requireLayout, writeSiteAsset } from "./assets";
import { Markdown } from "./components";

export default (file: File) => {
  const contents = fs.readFileSync(file.filename, "utf8");
  const { data, content } = frontmatter(contents);
  // @ts-ignore
  const Layout = requireLayout(data.layout);
  const html = renderToStaticMarkup(
    <Layout {...data} file={file}>
      <Markdown content={content} />
    </Layout>
  );
  writeSiteAsset("<!DOCTYPE HTML>" + html, {
    filename: file.url,
    extension: ".html",
  });
};
