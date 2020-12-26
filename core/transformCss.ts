import * as path from "path";
// @ts-ignore
import csso from "csso";
import { readAssetBuffer, writeSiteAsset } from "./assets";
import dev from "./dev";

export default (input: string) => {
  let css = input;

  css = css.replace(/url\(['"]?\/([^'")]+)['"]?\)/g, (_, url) => {
    const asset = readAssetBuffer(url);
    const source = writeSiteAsset(asset, { extension: path.extname(url) });
    return `url(${source})`;
  });

  if (dev) {
    return css;
  }

  css = csso.minify(css).css;

  return css;
};
