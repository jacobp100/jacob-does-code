import path from "path";
import useContent, { writeSiteAsset } from "./useContent";
import transformCss from "./useTransformCss";
import transformJs from "./useTransformJs";
import transformHtml from "./useTransformHtml";

export default () => {
  const content = useContent();

  return (asset: string) => {
    const extension = path.extname(asset);

    switch (extension) {
      case ".js": {
        const js = transformJs(content.asset(asset));
        return writeSiteAsset(js, { extension: ".js" });
      }
      case ".min.js": {
        const js = content.asset(asset);
        return writeSiteAsset(js, { extension: ".js" });
      }
      case ".css": {
        const css = transformCss(content.asset(asset));
        return writeSiteAsset(css, { extension: ".css" });
      }
      case ".html": {
        const html = transformHtml(content.asset(asset));
        return writeSiteAsset(html, { extension: ".html" });
      }
      default:
        return writeSiteAsset(content.assetBuffer(asset), { extension });
    }
  };
};
