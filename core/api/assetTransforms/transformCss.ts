import postcss, { AtRule, Declaration, Root, Rule } from "postcss";
// @ts-ignore
import transformClasses from "postcss-transform-classes";
// @ts-ignore
import csso from "csso";
import nestedAsync from "../../util/nestedAsync";
import type { Content } from "../useContent";
import { classNameForOrigin, cssVariable, Origin } from "../css";
import dev from "../../util/dev";
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

const optimizeVariableDeclarations = () => (root: Root) => {
  /*
  Converts the following,

  @media (something) {
    :root { --something: something; }
  }
  @media (something) {
    p { color: something; }
  }

  To,

  @media (something) {
    :root { --something: something; }
    p { color: something; }
  }

  And,

  :root { --something: something; }
  @media (something) {
    :root { --something: something; }
  }
  :root { --something: something-else; }
  
  To,

  :root { --something: something-else; }

  I can't decide if this is generally safe, but it seems to work for my use-cases.
  */
  type VarDecl = {
    mediaQuery: AtRule | undefined;
    rule: Rule;
    decl: Declaration;
  };
  const varDecls = new Set<VarDecl>();

  const removeVarDecl = (varDecl: VarDecl) => {
    varDecls.delete(varDecl);
    varDecl.rule.removeChild(varDecl.decl);
  };

  const isVarDecl = (decl: Declaration) => decl.prop.startsWith("--");

  const mediaQueriesEq = (a: AtRule | undefined, b: AtRule | undefined) =>
    a?.params === b?.params;
  const rulesEq = (a: Rule, b: Rule) => a.selector === b.selector;
  const declsEq = (a: Declaration, b: Declaration) => a.prop === b.prop;

  root.nodes.forEach((node) => {
    if (node.type === "atrule" && node.name === "media") {
      const mediaQuery = node;

      const rulesToAdd = new Map<string, Rule>();

      mediaQuery.walkRules((rule) => {
        varDecls.forEach((varDecl) => {
          if (mediaQueriesEq(mediaQuery, varDecl.mediaQuery)) {
            removeVarDecl(varDecl);

            const selector = varDecl.rule.selector;
            let rule = rulesToAdd.get(selector);
            if (rule == null) {
              rule = postcss.rule({ selector });
              rulesToAdd.set(selector, rule);
            }

            const decl = postcss.decl({
              prop: varDecl.decl.prop,
              value: varDecl.decl.value,
            });
            rule.prepend(decl);
          }
        });

        // Ensure we don't reverse ordering of rules when moving
        mediaQuery.prepend(rule, Array.from(rulesToAdd.values()));

        rule.walkDecls((decl) => {
          if (!isVarDecl(decl)) {
            return;
          }

          varDecls.add({ mediaQuery, rule, decl });
        });
      });
    } else if (node.type === "rule") {
      const rule = node;

      rule.walkDecls((decl) => {
        if (!isVarDecl(decl)) {
          return;
        }

        varDecls.forEach((varDecl) => {
          if (rulesEq(rule, varDecl.rule) && declsEq(decl, varDecl.decl)) {
            removeVarDecl(varDecl);
          }
        });

        varDecls.add({ mediaQuery: undefined, rule, decl });
      });
    }
  });
};

const className = (input: string) => classNameForOrigin(input, Origin.CSS);

export default async (content: Content, input: string) => {
  let { css } = await postcss([
    transformUrls(content),
    transformClasses({ transform: className }),
    transformVariables({ transform: cssVariable }),
    // optimizeVariableDeclarations(),
  ]).process(input, {
    from: undefined,
  });

  if (dev) {
    return css;
  }

  css = csso.minify(css).css;

  return css;
};
