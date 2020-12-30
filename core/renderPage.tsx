import { renderToStaticMarkup } from "react-dom/server";
// @ts-ignore
import frontmatter from "frontmatter";
import type { File } from "./files";
import { ContentContext, createContentContext } from "./useContent";
import { Markdown } from "./components";

const DefaultLayout = (props: any) => (
  <html>
    <head>
      <title>{props.title ?? "No title"}</title>
      <meta charSet="utf-8" />
    </head>
    <body>{props.children}</body>
  </html>
);

export default (file: File) => {
  const content = createContentContext();

  const page = frontmatter(content.page(file.filename));

  const { layout } = page.data;
  const Layout = layout != null ? content.layout(layout) : DefaultLayout;

  let htmlFragment = renderToStaticMarkup(
    <ContentContext.Provider value={content}>
      <Layout {...page.data} file={file}>
        <Markdown markdown={page.content} />
      </Layout>
    </ContentContext.Provider>
  );

  htmlFragment = htmlFragment.replace(/<\/?ignored-tag>/g, "");
  const html = "<!DOCTYPE HTML>" + htmlFragment;

  content.write(html, { filename: file.url, extension: ".html" });

  return {
    dependencies: content.dependencies,
  };
};
