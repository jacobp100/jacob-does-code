import * as path from "path";
// @ts-ignore
import { minify } from "uglify-js";
import { readAsset, writeSiteAsset } from "./assets";
import transformCss from "./transformCss";
import dev from "./dev";

const transformJsImports = (content: string): string => {
  return content.replace(/\/assets\/([^'"]+)/g, (_, asset) => {
    const extension = path.extname(asset);
    switch (extension) {
      case ".js": {
        // HACK: Don't compress since import statements fail in uglify
        const jsContent = transformJsImports(readAsset(asset));
        return writeSiteAsset(jsContent, { extension: ".js" });
      }
      case ".css": {
        const cssContent = transformCss(readAsset(asset));
        return writeSiteAsset(cssContent, { extension: ".css" });
      }
      default:
        return writeSiteAsset(readAsset(asset), { extension });
    }
  });
};

export default (input: string): string => {
  let output = transformJsImports(input);

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
