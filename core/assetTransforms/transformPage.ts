import * as path from "path";
// @ts-expect-error
import * as babel from "@babel/core";
// // @ts-expect-error
// import * as provider from "@mdx-js/react";
// import { compile } from "@mdx-js/mdx";
// @ts-expect-error
import smartypants from "@silvenon/remark-smartypants";
import { cwd } from "process";
import { assetTransform } from "../assetTransformer";
import type { Content } from "../useContent";

const projectPath = cwd();

let babelOptions: any;
try {
  babelOptions = require(path.join(projectPath, ".babelrc"));
} catch {
  babelOptions = {};
}

type Page = {
  title: string;
  Content: (props: any) => JSX.Element;
  Layout: (props: any) => JSX.Element;
  props: any;
};

export default assetTransform(
  async (content: Content, filename: string): Promise<Page> => {
    // Preserve imports to work with node imports
    const provider = await eval(`import("@mdx-js/react")`);
    const mdxJs = await eval(`import("@mdx-js/mdx")`);

    const mdx = content.read(filename);
    const basePath = path.dirname(
      path.resolve(projectPath, filename.slice("/".length))
    );
    const baseUrl = new URL(`file://${basePath}/`);

    const options = {
      ...provider,
      useDynamicImport: true,
      baseUrl,
      remarkPlugins: [smartypants],
    };

    let source = String(await mdxJs.compile(mdx, options));
    ({ code: source } = await babel.transform(source, {
      filename: __filename,
      ...babelOptions,
    }));

    const requireFixingFileUrls = (modulePath: string) =>
      content.require(modulePath.replace(/^file:\/\//, ""));
    const exports: any = {};
    new Function("require", "exports", source)(requireFixingFileUrls, exports);

    const {
      title = path.basename(filename, ".mdx"),
      default: Content,
      Layout,
      ...props
    } = exports;

    return { title, Content, Layout, props };
  }
);
