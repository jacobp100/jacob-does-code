import { Suspense } from "react";
import { renderToStaticNodeStream } from "react-dom/server";
// @ts-ignore
import deasync from "deasync";
// @ts-ignore
import frontmatter from "frontmatter";
import type { File } from "./files";
import { ContentContext, createContentContext } from "./useContent";
import { Markdown } from "./components";

const NoFallback = () => null;

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

  const stream = renderToStaticNodeStream(
    <Suspense fallback={NoFallback}>
      <ContentContext.Provider value={content}>
        <Layout {...page.data} file={file}>
          <Markdown markdown={page.content} />
        </Layout>
      </ContentContext.Provider>
    </Suspense>
  );

  let htmlFragments: Buffer[] = [];
  let htmlFragment: string | undefined;

  stream
    .on("data", (chunk) => {
      htmlFragments.push(chunk);
    })
    .on("end", () => {
      htmlFragment = Buffer.concat(htmlFragments).toString("utf8");
    });

  deasync.loopWhile(() => htmlFragment == null);

  htmlFragment = htmlFragment!.replace(/<\/?ignored-tag>/g, "");
  const html = "<!DOCTYPE HTML>" + htmlFragment;

  content.write(html, { filename: file.url, extension: ".html" });

  return {
    dependencies: content.dependencies,
  };
};
