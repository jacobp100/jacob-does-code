import * as path from "path";
import type { Content } from "../useContent.js";
import transformCss from "./transformCss.js";
import transformJs from "./transformJs.js";
import transformHtml from "./transformHtml.js";

export default async (content: Content, asset: string) => {
  const extension = path.extname(asset);

  switch (extension) {
    case ".js": {
      const js = await transformJs(content, content.asset(asset), {
        module: true,
      });
      return content.write(js, { extension: ".js" });
    }
    case ".min.js": {
      const js = content.asset(asset);
      return content.write(js, { extension: ".js" });
    }
    case ".css": {
      const css = await transformCss(content, content.asset(asset));
      return content.write(css, { extension: ".css" });
    }
    case ".html": {
      const html = await transformHtml(content, content.asset(asset));
      return content.write(html, { extension: ".html" });
    }
    default:
      return content.write(content.assetBuffer(asset), { extension });
  }
};
