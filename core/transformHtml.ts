// @ts-ignore
import posthtml from "posthtml";
// @ts-ignore
import minifier from "posthtml-minifier";
// @ts-ignore
import renderStaticReact from "./posthtml-static-react";
import * as components from "./components";
import { requireComponent } from "./assets";
import { classNames } from "./css";
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
    if (isReactComponent(node.tag) && node.attrs?.class != null) {
      node.attrs.class = classNames(node.attrs.class);
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
