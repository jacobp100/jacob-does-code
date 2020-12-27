// @ts-ignore
import posthtml from "posthtml";
// @ts-ignore
import minifier from "posthtml-minifier";
// @ts-ignore
import renderStaticReact from "./posthtml-static-react";
import * as components from "./components";
import { requireComponent } from "./assets";
import transformAsset from "./transformAsset";
import { className } from "./css";
import { isReactComponent } from "./htmlUtil";

const includes = new Proxy(
  {},
  {
    has: () => true,
    // @ts-ignore
    get: (_, name) => components[name] ?? requireComponent(name),
  }
);

const transformClassNames = () => (tree: any) =>
  tree.walk((node: any) => {
    const classes = !isReactComponent(node.tag)
      ? node.attrs?.class?.split(/\s+/).map(className).join(" ")
      : null;
    if (classes != null) {
      node.attrs.class = classes;
    }

    return node;
  });

export default (input: string) => {
  const postHtmlResult = posthtml()
    .use(transformClassNames())
    .use(renderStaticReact("", includes))
    .use(minifier({ collapseWhitespace: true, removeComments: true }))
    .process(input, { sync: true });
  // @ts-ignore
  return postHtmlResult.html as string;
};
