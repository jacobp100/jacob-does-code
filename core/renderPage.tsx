import { renderToStaticMarkup } from "react-dom/server";
// @ts-ignore
import MDX from "@mdx-js/runtime";
// @ts-ignore
import frontmatter from "frontmatter";
import type { File } from "./files";
import {
  ContentContext,
  createContentContext,
  getComponentNames,
} from "./useContent";
import { className, variable } from "./css";
import { cacheTransform } from "./cacheTransform";
import * as builtInComponents from "./components";
import htmlComponents from "./htmlComponents";

const DefaultLayout = (props: any) => (
  <html>
    <head>
      <title>{props.title ?? "No title"}</title>
      <meta charSet="utf-8" />
    </head>
    <body>{props.children}</body>
  </html>
);

type Transform = {
  data: Record<string, any>;
  children: JSX.Element;
};

const transform = cacheTransform<Transform>((content, file: File) => {
  const page = frontmatter(content.page(file.filename));

  const userComponents = getComponentNames().reduce((accum, TagName) => {
    accum[TagName] = (props: any) => {
      const Component = content.component(TagName);
      return <Component {...props} />;
    };

    return accum;
  }, {} as Record<string, any>);

  // The MDX is transformed at component execution time
  // If we call this directly, it'll run immediately,
  // so the heavy part is cached
  // This is somewhat less than idiomatic React
  const markdown = MDX({
    components: {
      ...htmlComponents,
      ...builtInComponents,
      ...userComponents,
    },
    scope: {
      cssVariable: variable,
      cssClassName: className,
    },
    remarkPlugins: [require("@silvenon/remark-smartypants")],
    children: page.content,
  });

  return {
    data: page.data,
    children: markdown,
  };
});

export default (file: File) => {
  const content = createContentContext();

  // You can cache converting mdx into React elements
  // But you still need to re-run everything through React so every component
  // re-evaluated, and any with their cache invalidated  rerun their
  // transformation steps

  const { data, children } = transform(content, file);

  const { layout } = data;
  const Layout = layout != null ? content.layout(layout) : DefaultLayout;

  const htmlFragment = renderToStaticMarkup(
    <ContentContext.Provider value={content}>
      <Layout {...data} file={file}>
        {children}
      </Layout>
    </ContentContext.Provider>
  );

  const html = "<!DOCTYPE HTML>" + htmlFragment;

  content.write(html, { filename: file.url, extension: ".html" });

  return {
    dependencies: content.dependencies,
  };
};
