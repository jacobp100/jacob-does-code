import * as React from "react";
import * as path from "path";
import { Suspense } from "react";
// @ts-ignore
import { renderToPipeableStream } from "react-dom/server.js";
// @ts-ignore
import frontmatter from "frontmatter";
import type { File } from "../api/api.js";
import { Markdown, ContentContext, createContentContext } from "../api/api.js";
import AsyncWritable from "./AsyncWritable.js";

const DefaultLayout = (props: any) => (
  <html>
    <head>
      <title>{props.title ?? "No title"}</title>
      <meta charSet="utf-8" />
    </head>
    <body>{props.children}</body>
  </html>
);

export default async (file: File) => {
  const content = createContentContext();

  const {
    data,
    content: mdx,
    ...rest
  } = frontmatter(content.page(file.filename));

  const { layout } = data;
  const Layout = layout != null ? content.layout(layout) : DefaultLayout;

  const stream = new AsyncWritable();

  const { pipe } = renderToPipeableStream(
    <Suspense fallback="Loading">
      <ContentContext.Provider value={content}>
        <Layout {...data} file={file}>
          <Markdown
            mdx={mdx}
            baseUrl={new URL(`file://${path.dirname(file.filename)}/`)}
          />
        </Layout>
      </ContentContext.Provider>
    </Suspense>,
    { onCompleteAll: () => pipe(stream) }
  );

  let html = await stream.awaited;
  html = html.replace(/<!--(?:\s|\/\$|\$)-->/g, "");

  content.write(html, { filename: file.url, extension: ".html" });

  return {
    dependencies: content.dependencies,
  };
};
