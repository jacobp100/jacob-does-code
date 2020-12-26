import * as path from "path";
import postcss, { root } from "postcss";
// @ts-ignore
import transformClasses from "postcss-transform-classes";
// @ts-ignore
import csso from "csso";
import { readAssetBuffer, writeSiteAsset } from "./assets";
import { variable, className } from "./css";
import dev from "./dev";

const transformUrls = () => (root: any) => {
  root.walkDecls((decl: any) => {
    decl.value = (decl.value as string).replace(
      /url\(['"]?\/assets\/([^'")]+)['"]?\)/g,
      (_, url) => {
        const asset = readAssetBuffer(url);
        const source = writeSiteAsset(asset, { extension: path.extname(url) });
        return `url(${source})`;
      }
    );
  });
};

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

export default (input: string) => {
  let css = postcss([
    transformUrls(),
    transformClasses({ transform: className }),
    transformVariables({ transform: variable }),
  ]).process(input).css;

  if (dev) {
    return css;
  }

  css = csso.minify(css).css;

  return css;
};
