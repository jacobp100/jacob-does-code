import { renderToStaticMarkup } from "react-dom/server";
// @ts-ignore
import frontmatter from "frontmatter";
import { Markdown } from "../components";
import { requireLayout, writeSiteAsset } from "./assets";

export default (contents: string, filename: string) => {
  const { data, content } = frontmatter(contents);
  // @ts-ignore
  const Layout = requireLayout(data.layout);
  const html = renderToStaticMarkup(
    <Layout {...data}>
      <Markdown content={content} />
    </Layout>
  );
  writeSiteAsset("<!DOCTYPE HTML>" + html, { filename, extension: ".html" });
};
