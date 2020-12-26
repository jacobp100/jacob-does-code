import * as path from "path";
// @ts-ignore
import posthtml from "posthtml";
// @ts-ignore
import minifier from "posthtml-minifier";
import { readAssetBuffer, writeSiteAsset } from "./assets";
// @ts-ignore
import renderStaticReact from "./posthtml-static-react";
import * as components from "./components";
import { requireComponent } from "./assets";
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

const transformClassNames = () => (tree: any) => {
  tree.walk((node: any) => {
    const classes = !isReactComponent(node.tag)
      ? node.attrs?.class?.split(/\s+/).map(className).join(" ")
      : null;
    if (classes != null) {
      node.attrs.class = classes;
    }

    return node;
  });
};

const transformVideoComponents = () => (tree: any) =>
  tree.match([{ tag: "source" }], (node: any) => {
    const filename = (node.attrs.src as string | undefined)?.match(
      /^\/assets\/(.*)$/
    )?.[1];

    if (filename != null) {
      const assetUrl = writeSiteAsset(readAssetBuffer(filename), {
        extension: path.extname(filename),
      });
      node.attrs.src = assetUrl;
    }

    return node;
  });

export default (input: string) => {
  const postHtmlResult = posthtml()
    .use(transformClassNames())
    .use(transformVideoComponents())
    .use(renderStaticReact("", includes))
    .use(minifier({ collapseWhitespace: true, removeComments: true }))
    .process(input, { sync: true });
  // @ts-ignore
  return postHtmlResult.html as string;
};
