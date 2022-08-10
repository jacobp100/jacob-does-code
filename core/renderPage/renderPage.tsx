import * as React from "react";
import { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import {
  Page,
  ContentContext,
  createContentContext,
  PageContext,
} from "../api/api";
import AsyncWritable from "./AsyncWritable";
import PageComponent from "./PageComponent";

type Props = {
  page: Page;
  pages: Page[];
};

export default async ({ page, pages }: Props) => {
  const content = createContentContext();

  const stream = new AsyncWritable();

  const { pipe } = renderToPipeableStream(
    <Suspense fallback="Loading">
      <PageContext.Provider value={pages}>
        <ContentContext.Provider value={content}>
          <PageComponent {...page} />
        </ContentContext.Provider>
      </PageContext.Provider>
    </Suspense>,
    { onAllReady: () => pipe(stream) }
  );

  let html = await stream.awaited;
  html = html.replace(/<!--(?:\s|\/\$|\$)-->/g, "");

  content.write(html, { filename: page.url, extension: ".html" });

  return {
    dependencies: content.dependencies,
  };
};
