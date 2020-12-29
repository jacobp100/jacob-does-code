import { renderToStaticMarkup } from "react-dom/server";
// @ts-ignore
import frontmatter from "frontmatter";
import type { File } from "./files";
import {
  ContentContext,
  createContentContext,
  writeSiteAsset,
} from "./useContent";
import { Markdown } from "./components";

export default (file: File) => {
  const content = createContentContext();

  const page = frontmatter(content.page(file.filename));
  const Layout = content.layout(page.data.layout);

  let html = renderToStaticMarkup(
    <ContentContext.Provider value={content}>
      <Layout {...page.data} file={file}>
        <Markdown content={page.content} />
      </Layout>
    </ContentContext.Provider>
  );

  html = html.replace(/<\/?ignored-tag>/g, "");

  writeSiteAsset("<!DOCTYPE HTML>" + html, {
    filename: file.url,
    extension: ".html",
  });

  return {
    dependencies: content.dependencies,
  };
};
