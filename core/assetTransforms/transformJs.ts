import { parse } from "@babel/parser";
// @ts-expect-error
import traverse from "@babel/traverse";
// @ts-expect-error
import generate from "@babel/generator";
import * as t from "@babel/types";
import { minify } from "terser";
import { className, cssVariable } from "../css";
import { Content } from "../useContent";
import nestedAsync from "../util/nestedAsync";
import transformAsset from "./transformAsset";

const stringHandlers: Record<string, (str: string) => string> = {
  className,
  cssVariable,
};

const isImportedFromCore = (path: any) => {
  const callee = path.get("callee");
  const importSpecifier = path.scope.getBinding(callee.node.name)?.path
    .parentPath;

  return (
    importSpecifier != null &&
    importSpecifier.isImportDeclaration() &&
    importSpecifier.get("source").isStringLiteral({ value: "super-ssg" })
  );
};

export default async (content: Content, input: string, { module = false }) => {
  const ast = parse(input, {
    sourceType: "module",
  });

  await nestedAsync((asyncTransform) => {
    const importsToRemove: any = [];

    traverse(ast, {
      Program: {
        exit() {
          importsToRemove.forEach((path: any) => {
            path.remove();
          });
        },
      },
      CallExpression(path: any) {
        const callee = path.get("callee");
        const argument = path.get("arguments.0");

        if (
          callee.isMemberExpression() &&
          callee.get("object").isIdentifier({ name: "require" }) &&
          callee.get("property").isIdentifier({ name: "resolve" }) &&
          argument.isStringLiteral()
        ) {
          asyncTransform(async () => {
            const asset = await transformAsset(content, argument.node.value);
            path.replaceWith(t.stringLiteral(asset));
          });
        } else if (callee.isImport()) {
          asyncTransform(async () => {
            const asset = await transformAsset(content, argument.node.value);
            argument.node.value = asset;
          });
        } else if (callee.isIdentifier() && isImportedFromCore(path)) {
          const { name } = callee.node;
          const stringHandler = stringHandlers[name];

          if (stringHandler == null) {
            return;
          } else if (!argument.isStringLiteral()) {
            throw new Error(
              `Only string literals are handled in calls to ${name} within JS assets`
            );
          } else {
            const stringValue = argument.node.value;
            path.replaceWith(t.stringLiteral(stringHandler(stringValue)));
          }
        }
      },
      ImportDeclaration(path: any) {
        const importPath = path.node.source.value;

        if (importPath.startsWith("/")) {
          asyncTransform(async () => {
            content.read(importPath);
            const asset = await transformAsset(content, importPath);
            path.node.source.value = asset;
          });
        } else if (importPath === "super-ssg") {
          const allHandlers = Object.keys(stringHandlers);

          path.get("specifiers").forEach((specifier: any) => {
            const imported = specifier.node.imported.name;
            if (!allHandlers.includes(imported)) {
              throw new Error(
                `Export ${imported} is not available in JS assets`
              );
            }
          });

          importsToRemove.push(path);
        }
      },
    });
  });

  let js = generate(ast).code;

  if (process.env.NODE_ENV === "development") {
    return js;
  }

  const { code } = await minify(js, {
    module,
  });

  if (code == null) {
    throw new Error("Unknown error");
  }

  js = code;

  return js;
};
