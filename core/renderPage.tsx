import path from "path";
import { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { Code } from "./components";
import {
  ConfigContext,
  getConfig,
  Page,
  ResolvedConfig,
  useConfig,
} from "./config";
import transformPage from "./transformPage";
import useContent, { ContentContext, createContentContext } from "./useContent";
import AsyncWritable from "./util/AsyncWritable";

const DefaultLayout = ({
  filename,
  title = path.basename(filename, ".mdx"),
  children,
}: any) => (
  <html>
    <head>
      <title>{title}</title>
      <meta charSet="utf-8" />
    </head>
    <body>{children}</body>
  </html>
);

const PageComponent = (page: Page) => {
  const content = useContent();
  const config = useConfig();

  const { Content, props } = transformPage(content, page.filename);
  const Layout = config.Layout ?? DefaultLayout;

  return (
    <Layout {...page} {...props}>
      <Content components={{ code: Code }} />
    </Layout>
  );
};

type Props = {
  page: Page;
  pages: Page[];
};

export default async ({ page, pages }: Props) => {
  const content = createContentContext();
  const config: ResolvedConfig = { ...getConfig(content), pages };

  const stream = new AsyncWritable();

  const { pipe } = renderToPipeableStream(
    <Suspense fallback="Loading">
      <ConfigContext.Provider value={config}>
        <ContentContext.Provider value={content}>
          <PageComponent {...page} />
        </ContentContext.Provider>
      </ConfigContext.Provider>
    </Suspense>,
    {
      onAllReady: () => pipe(stream),
      onError: console.error,
    }
  );

  let html = await stream.awaited;
  html = html.replace(/<!--(?:\s|\/\$|\$)-->/g, "");

  content.write(html, { filename: page.url, extension: ".html" });

  return {
    dependencies: content.dependencies,
  };
};
