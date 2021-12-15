import * as React from "react";
import { Suspense } from "react";
// @ts-ignore
import { renderToPipeableStream } from "react-dom/server";
// @ts-ignore
import type { File } from "../api/api";
import { ContentContext, createContentContext } from "../api/api";
import Page from "./Page";
import AsyncWritable from "./AsyncWritable";

export default async (file: File) => {
  const content = createContentContext();

  const stream = new AsyncWritable();

  const { pipe } = renderToPipeableStream(
    <Suspense fallback="Loading">
      <ContentContext.Provider value={content}>
        <Page {...file} />
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
