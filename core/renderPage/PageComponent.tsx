import * as React from "react";
import { Code, useContent } from "../api/api";
import evalPage from "../api/util/evalPage";
import type { Page } from "../api/usePages";

export default (page: Page): JSX.Element => {
  const content = useContent();
  const { title, Content, Layout, layoutProps } = evalPage(
    content,
    page.filename
  );

  const children = <Content components={{ code: Code }} />;

  return Layout != null ? (
    <Layout {...page} title={title} {...layoutProps}>
      {children}
    </Layout>
  ) : (
    children
  );
};
