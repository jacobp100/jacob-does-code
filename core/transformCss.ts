import * as path from "path";
import postcss from "postcss";
// @ts-ignore
import transformClasses from "postcss-transform-classes";
// @ts-ignore
import csso from "csso";
import { readAssetBuffer, writeSiteAsset } from "./assets";
import { variable, className } from "./css";
import dev from "./dev";

const transformUrls = (input: string) =>
  input.replace(/url\(['"]?\/assets\/([^'")]+)['"]?\)/g, (_, url) => {
    const asset = readAssetBuffer(url);
    const source = writeSiteAsset(asset, { extension: path.extname(url) });
    return `url(${source})`;
  });

const transformVariables = ({ transform }: any) => (root: any) => {
  root.walkDecls((decl: any) => {
    if (decl.prop.startsWith("--")) {
      decl.prop = transform(decl.prop);
    }

    decl.value = (decl.value as string).replace(
      /var\s*\(\s*(--[_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/gi,
      (_, name, fallback) => {
        const transformed = transform(name);
        return fallback
          ? `var(${transformed}, ${fallback})`
          : `var(${transformed})`;
      }
    );
  });
};

const transformClassNamesVairables = (input: string) =>
  postcss([
    transformClasses({ transform: className }),
    transformVariables({ transform: variable }),
  ]).process(input).css;

export default (input: string) => {
  let css = input;

  css = transformUrls(css);
  css = transformClassNamesVairables(css);

  if (dev) {
    return css;
  }

  css = csso.minify(css).css;

  return css;
};
