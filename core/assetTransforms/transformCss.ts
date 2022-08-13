import postcss, { Root } from "postcss";
// @ts-expect-error
import transformClasses from "postcss-transform-classes";
// @ts-expect-error
import csso from "csso";
import { classNameForOrigin, cssVariable, Origin } from "../css";
import dev from "../dev";
import type { Content } from "../useContent";
import nestedAsync from "../util/nestedAsync";
import transformAsset from "./transformAsset";

const transformUrls = (content: Content) => {
  const urlRegExp = /url\(['"]?(\/[^'")]+)['"]?\)/g;

  return (root: Root) =>
    nestedAsync((asyncTransform) => {
      root.walkDecls((decl) => {
        asyncTransform(async () => {
          const replacements = await Promise.all(
            Array.from(decl.value.matchAll(urlRegExp), async ([_, url]) => {
              const asset = await transformAsset(content, url);
              return `url(${asset})`;
            })
          );

          decl.value = decl.value.replace(
            urlRegExp,
            () => replacements.shift()!
          );
        });
      });
    });
};

const transformVariables =
  ({ transform }: any) =>
  (root: Root) =>
    root.walkDecls((decl) => {
      if (decl.prop.startsWith("--")) {
        decl.prop = transform(decl.prop);
      }

      decl.value = decl.value.replace(
        /var\s*\(\s*(--[_a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/gi,
        (_, name, fallback) => {
          const transformed = transform(name);
          return fallback
            ? `var(${transformed}, ${fallback})`
            : `var(${transformed})`;
        }
      );
    });

const className = (input: string) => classNameForOrigin(input, Origin.CSS);

export default async (content: Content, input: string) => {
  let { css } = await postcss([
    transformUrls(content),
    transformClasses({ transform: className }),
    transformVariables({ transform: cssVariable }),
  ]).process(input, {
    from: undefined,
  });

  if (dev) {
    return css;
  }

  css = csso.minify(css).css;

  return css;
};
