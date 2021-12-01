import * as React from "react";
import { useMemo } from "react";
// @ts-ignore
import * as runtime from "react/jsx-runtime.js";
// @ts-ignore
import * as provider from "@mdx-js/react";
import { evaluate } from "@mdx-js/mdx";
// @ts-ignore
import smartypants from "@silvenon/remark-smartypants";
import useContent, { getComponentNames } from "../../useContent.js";
import * as builtInComponents from "../components.js";
import { assetTransform } from "../../assetTransformer.js";
import htmlComponents from "./htmlComponents.js";

const transform = assetTransform(
  async (_content, mdx: string, baseUrl: URL) => {
    const { default: Component } = await evaluate(mdx, {
      ...provider,
      ...runtime,
      useDynamicImport: true,
      baseUrl,
      remarkPlugins: [smartypants],
    });
    return Component;
  },
  { encodable: false }
);

type Props = {
  mdx: string;
  baseUrl: URL;
};

export default ({ mdx, baseUrl }: Props): JSX.Element => {
  const content = useContent();
  const Component = transform(content, mdx, baseUrl);

  const components = useMemo(() => {
    const userComponents = getComponentNames().reduce((accum, name) => {
      // Lazily require so only actual dependencies get marked
      accum[name] = (props: any) => {
        const Component = content.component(name);
        return <Component {...props} />;
      };

      return accum;
    }, {} as Record<string, any>);

    return {
      ...htmlComponents,
      ...builtInComponents,
      ...userComponents,
    };
  }, [content]);

  return <Component components={components} />;
};
