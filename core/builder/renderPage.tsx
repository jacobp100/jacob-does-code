import { Suspense } from "react";
// @ts-ignore
import { pipeToNodeWritable } from "react-dom/server";
// @ts-ignore
import frontmatter from "frontmatter";
import type { File } from "../api";
import { Markdown, ContentContext, createContentContext } from "../api";
import AsyncWritable from "./AsyncWritable";

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

  const { startWriting } = pipeToNodeWritable(
    <Suspense fallback="">
      <ContentContext.Provider value={content}>
        <Layout {...data} file={file}>
          <Markdown mdx={mdx} />
        </Layout>
      </ContentContext.Provider>
    </Suspense>,
    stream,
    { onCompleteAll: () => startWriting() }
  );

  let html = await stream.awaited;
  html = html.replace(/<!--(?:\s|\/\$|\$)-->/g, "");

  content.write(html, { filename: file.url, extension: ".html" });

  return {
    dependencies: content.dependencies,
  };
};
