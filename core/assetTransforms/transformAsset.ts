import * as path from "path";
import type { Content } from "../useContent";
import transformCss from "./transformCss";
import transformHtml from "./transformHtml";
import transformJs from "./transformJs";

// NB - doesn't run `transformPage`
export default async (content: Content, src: string) => {
  const extension = path.extname(src);

  switch (extension) {
    case ".js": {
      const js = await transformJs(content, content.read(src), {
        module: true,
      });
      return content.write(js, { extension: ".js" });
    }
    case ".min.js": {
      const js = content.read(src);
      return content.write(js, { extension: ".js" });
    }
    case ".css": {
      const css = await transformCss(content, content.read(src));
      return content.write(css, { extension: ".css" });
    }
    case ".html": {
      const html = await transformHtml(content, content.read(src));
      return content.write(html, { extension: ".html" });
    }
    default:
      return content.write(content.readBuffer(src), { extension });
  }
};
