import * as path from "path";
import { InlineCss } from "../components";
import transformCss from "../components/util/transformCss";
import transformJs from "../components/util/transformJs";
import { readAsset, writeSiteAsset } from "../core/assets";

const transformJsImports = (content: string): string => {
  return content.replace(/\/assets\/([^'"]+)/g, (_, asset) => {
    switch (path.extname(asset)) {
      case ".js": {
        // Don't compress since import statements fail in uglify
        const jsContent = transformJsImports(readAsset(asset));
        return writeSiteAsset(jsContent, { extension: ".js" });
      }
      case ".css": {
        const cssContent = transformCss(readAsset(asset));
        return writeSiteAsset(cssContent, { extension: ".css" });
      }
      case ".html":
        return writeSiteAsset(readAsset(asset), { extension: ".html" });
      default:
        throw new Error("Unknown asset");
    }
  });
};

export default () => {
  const inlineJs = transformJs(
    transformJsImports(readAsset("technicalc/computation-critical.js"))
  );

  return (
    <>
      <div
        id="computation"
        className="computation computation--form-hidden"
        hidden
      />
      <InlineCss src="technicalc/computation-critical.css" />
      <script dangerouslySetInnerHTML={{ __html: inlineJs }} />
    </>
  );
};
