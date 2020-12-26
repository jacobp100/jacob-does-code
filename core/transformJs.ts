import * as path from "path";
import { minify } from "terser";
import { readAsset, writeSiteAsset } from "./assets";
import transformCss from "./transformCss";
import transformHtml from "./transformHtml";
import { variable, className } from "./css";
import dev from "./dev";
import syncPromise from "./syncPromise";

const transformCssVairables = (input: string) =>
  input.replace(/CSS_VARS\[['"]([^'"]*)['"]\]/g, (_, name) => {
    return JSON.stringify(variable(name));
  });

const transformCssClassNames = (input: string) =>
  input.replace(/CSS_CLASSES\[['"]([^'"]*)['"]\]/g, (_, name) => {
    return JSON.stringify(className(name));
  });

const transformJsImports = (content: string): string => {
  const transformAsset = (asset: string) => {
    const extension = path.extname(asset);

    switch (extension) {
      case ".js": {
        const js = transformJs(readAsset(asset));
        return writeSiteAsset(js, { extension: ".js" });
      }
      case ".min.js": {
        const js = readAsset(asset);
        return writeSiteAsset(js, { extension: ".js" });
      }
      case ".css": {
        const css = transformCss(readAsset(asset));
        return writeSiteAsset(css, { extension: ".css" });
      }
      case ".html": {
        const html = transformHtml(readAsset(asset));
        return writeSiteAsset(html, { extension: ".html" });
      }
      default:
        return writeSiteAsset(readAsset(asset), { extension });
    }
  };

  // FIXME: This needs a real babel plugin
  return content
    .replace(
      /require\.resolve\(\s*['"]\/assets\/([^'"]+)['"]\s*\)/g,
      (_, asset) => JSON.stringify(transformAsset(asset))
    )
    .replace(
      /import\(\s*['"]\/assets\/([^'"]+)['"]\s*\)/g,
      (_, asset) => `import(${JSON.stringify(transformAsset(asset))})`
    )
    .replace(
      /import([^'"]*)['"]\/assets\/([^'"]+)['"]/g,
      (_, maybeSpecifiersAndFrom, asset) =>
        `import ${maybeSpecifiersAndFrom} ${JSON.stringify(
          transformAsset(asset)
        )}`
    );
};

const transformJs = (input: string) => {
  let js = input;
  js = transformCssVairables(js);
  js = transformCssClassNames(js);
  js = transformJsImports(js);

  if (dev) {
    return js;
  }

  const result = syncPromise(minify(js));

  if (result.type !== "ok") {
    throw result.error ?? new Error("Unknown error");
  }

  const code = result.value.code;

  if (code == null) {
    throw new Error("Unknown error");
  }

  js = code;

  return js;
};

export default transformJs;
