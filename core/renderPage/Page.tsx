import * as React from "react";
import { Code, useContent } from "../api/api";
import evalPage from "../api/util/evalPage";
import type { File } from "../util/projectFiles";

export default ({ filename, date }: File): JSX.Element => {
  const content = useContent();
  const { title, Content, Layout, layoutProps } = evalPage(content, filename);

  const children = <Content components={{ code: Code }} />;

  return Layout != null ? (
    <Layout title={title} date={date} {...layoutProps}>
      {children}
    </Layout>
  ) : (
    children
  );
};
