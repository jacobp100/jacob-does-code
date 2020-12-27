import * as path from "path";
import { readAsset, readAssetBuffer, writeSiteAsset } from "./assets";
import transformCss from "./transformCss";
import transformJs from "./transformJs";
import transformHtml from "./transformHtml";

export default (asset: string) => {
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
      return writeSiteAsset(readAssetBuffer(asset), { extension });
  }
};
