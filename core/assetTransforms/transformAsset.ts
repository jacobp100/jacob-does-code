import * as path from "path";
import type { Content } from "../useContent";
import transformCss from "./transformCss";
import transformHtml from "./transformHtml";
import transformJs from "./transformJs";

// NB - doesn't run `transformPage`
export default async (content: Content, asset: string) => {
  const extension = path.extname(asset);

  switch (extension) {
    case ".js": {
      const js = await transformJs(content, content.read(asset), {
        module: true,
      });
      return content.write(js, { extension: ".js" });
    }
    case ".min.js": {
      const js = content.read(asset);
      return content.write(js, { extension: ".js" });
    }
    case ".css": {
      const css = await transformCss(content, content.read(asset));
      return content.write(css, { extension: ".css" });
    }
    case ".html": {
      const html = await transformHtml(content, content.read(asset));
      return content.write(html, { extension: ".html" });
    }
    default:
      return content.write(content.readBuffer(asset), { extension });
  }
};
