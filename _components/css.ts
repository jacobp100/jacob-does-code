import * as path from "path";
// @ts-ignore
import csso from "csso";
import { readAssetBuffer, writeSiteAsset } from "../core/assets";
import dev from "../core/dev";

export default (input: string) => {
  let css = input;

  css = css.replace(/url\(['"]?\/([^'")]+)['"]?\)/g, (_, url) => {
    const asset = readAssetBuffer(url);
    const extension = path.extname(url).slice(".".length);
    const source = writeSiteAsset(asset, { extension });
    return `url(${source})`;
  });

  if (dev) {
    return css;
  }

  css = csso.minify(css, { forceMediaMerge: true }).css;

  return css;
};
