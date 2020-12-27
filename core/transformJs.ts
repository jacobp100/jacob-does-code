import { minify } from "terser";
import { variable, className } from "./css";
import transformAsset from "./transformAsset";
import syncPromise from "./syncPromise";
import dev from "./dev";

const transformCssVairables = (input: string) =>
  input.replace(/CSS_VARS\[['"]([^'"]*)['"]\]/g, (_, name) => {
    return JSON.stringify(variable(name));
  });

const transformCssClassNames = (input: string) =>
  input.replace(/CSS_CLASSES\[['"]([^'"]*)['"]\]/g, (_, name) => {
    return JSON.stringify(className(name));
  });

// FIXME: This needs a real babel plugin
const transformJsImports = (content: string): string =>
  content
    .replace(
      /require\.resolve\(\s*['"](\/assets\/[^'"]+)['"]\s*\)/g,
      (_, asset) => JSON.stringify(transformAsset(asset))
    )
    .replace(
      /import\(\s*['"](\/assets\/[^'"]+)['"]\s*\)/g,
      (_, asset) => `import(${JSON.stringify(transformAsset(asset))})`
    )
    .replace(
      /import([^'"]*)['"](\/assets\/[^'"]+)['"]/g,
      (_, maybeSpecifiersAndFrom, asset) =>
        `import ${maybeSpecifiersAndFrom} ${JSON.stringify(
          transformAsset(asset)
        )}`
    );

export default (input: string) => {
  let js = input;
  js = transformCssVairables(js);
  js = transformCssClassNames(js);
  js = transformJsImports(js);

  if (dev) {
    return js;
  }

  const result = syncPromise(minify(js));

  if (result.type !== "ok") {
    throw result.error ?? new Error("Unknown error");
  }

  const code = result.value.code;

  if (code == null) {
    throw new Error("Unknown error");
  }

  js = code;

  return js;
};
