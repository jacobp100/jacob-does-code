import path from "path";
import useContent, { Content } from "./useContent";
import transformCss from "./transformCss";
import transformJs from "./transformJs";
import transformHtml from "./transformHtml";

export default (content: Content, asset: string) => {
  const extension = path.extname(asset);

  switch (extension) {
    case ".js": {
      const js = transformJs(content, content.asset(asset));
      return content.write(js, { extension: ".js" });
    }
    case ".min.js": {
      const js = content.asset(asset);
      return content.write(js, { extension: ".js" });
    }
    case ".css": {
      const css = transformCss(content, content.asset(asset));
      return content.write(css, { extension: ".css" });
    }
    case ".html": {
      const html = transformHtml(content, content.asset(asset));
      return content.write(html, { extension: ".html" });
    }
    default:
      return content.write(content.assetBuffer(asset), { extension });
  }
};
