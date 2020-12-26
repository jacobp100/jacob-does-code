import * as path from "path";
// @ts-ignore
import posthtml from "posthtml";
// @ts-ignore
import minifier from "posthtml-minifier";
import { readAssetBuffer, writeSiteAsset } from "./assets";
import { className } from "./css";
import dev from "./dev";

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

export default (input: string, { minify = true } = {}) => {
  // FIXME: use posthtml or something
  let html = input;

  html = html.replace(/class="([^"]*)"/g, (_, classes) => {
    const transformed = classes.split(/\s+/g).map(className).join(" ");
    return `class="${transformed}"`;
  });

  let builder = posthtml().use(transformVideoComponents());
  if (!dev && minify) {
    builder = builder.use(
      minifier({ collapseWhitespace: true, removeComments: true })
    );
  }
  const postHtmlResult = builder.process(html, { sync: true });
  // @ts-ignore
  html = postHtmlResult.html;

  return html;
};
