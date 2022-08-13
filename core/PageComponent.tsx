import * as React from "react";
import { transformPage } from "./assetTransforms";
import { Code } from "./components/components";
import useContent from "./useContent";
import type { Page } from "./usePages";

export default (page: Page): JSX.Element => {
  const content = useContent();
  const { title, Content, Layout, props } = transformPage(
    content,
    page.filename
  );

  const children = <Content components={{ code: Code }} />;

  return Layout != null ? (
    <Layout {...page} title={title} {...props}>
      {children}
    </Layout>
  ) : (
    children
  );
};
