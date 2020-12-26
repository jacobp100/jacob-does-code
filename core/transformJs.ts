import * as path from "path";
// @ts-ignore
import { minify } from "uglify-js";
import { readAsset, writeSiteAsset } from "./assets";
import transformCss from "./transformCss";
import transformHtml from "./transformHtml";
import { variable, className } from "./css";
import dev from "./dev";

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
        const js = transformJsNoMinify(readAsset(asset));
        // HACK: Don't compress since import statements fail in uglify
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

const transformJsNoMinify = (input: string) => {
  let js = input;
  js = transformCssVairables(js);
  js = transformCssClassNames(js);
  js = transformJsImports(js);
  return js;
};

export default (input: string): string => {
  let output = transformJsNoMinify(input);

  if (dev) {
    return output;
  }

  const result = minify(output);
  output = result.code;

  if (result.error) {
    throw new Error(result.error);
  }

  return output;
};
