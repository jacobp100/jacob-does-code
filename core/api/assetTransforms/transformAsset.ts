import path from "path";
import type { Content } from "../useContent";
import transformCss from "./transformCss";
import transformJs from "./transformJs";
import transformHtml from "./transformHtml";

export default async (content: Content, asset: string) => {
  const extension = path.extname(asset);

  switch (extension) {
    case ".js": {
      const js = await transformJs(content, content.asset(asset));
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
