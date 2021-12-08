import React from "react";
// @ts-ignore
import MDX from "@mdx-js/runtime";
import { className, cssVariable } from "../../css";
import useContent, { getComponentNames } from "../../useContent";
import htmlComponents from "./htmlComponents";
import * as builtInComponents from "../components";

type Props = {
  mdx: string;
};

export default ({ mdx }: Props): JSX.Element => {
  const content = useContent();

  // This can't be moved to an asset transform, as MDX lazily loads the
  // elements at React render time, and there's no way to force it to do this
  // sychronously. Any hacks end up missing dependencies.
  const options = React.useMemo(() => {
    const userComponents = getComponentNames().reduce((accum, TagName) => {
      accum[TagName] = (props: any) => {
        const Component = content.component(TagName);
        return <Component {...props} />;
      };

      return accum;
    }, {} as Record<string, any>);

    return {
      components: {
        ...htmlComponents,
        ...builtInComponents,
        ...userComponents,
      },
      scope: {
        cssVariable: cssVariable,
        cssClassName: className,
      },
      remarkPlugins: [require("@silvenon/remark-smartypants")],
    };
  }, [content]);

  return <MDX {...options}>{mdx}</MDX>;
};
