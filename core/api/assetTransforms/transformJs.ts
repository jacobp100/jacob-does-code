import { parse } from "@babel/parser";
// @ts-ignore
import traverse from "@babel/traverse";
// @ts-ignore
import generate from "@babel/generator";
import * as t from "@babel/types";
import { minify } from "terser";
import nestedAsync from "../../util//nestedAsync";
import { Content } from "../useContent";
import { cssVariable, className } from "../css";
import dev from "../../util/dev";
import transformAsset from "./transformAsset";

export default async (content: Content, input: string, { module = false }) => {
  const ast = parse(input, {
    sourceType: "module",
  });

  await nestedAsync((asyncTransform) => {
    traverse(ast, {
      MemberExpression(path: any) {
        if (
          path.node.computed &&
          path.get("object").isIdentifier({ name: "CSS_VARS" }) &&
          path.get("property").isStringLiteral()
        ) {
          path.replaceWith(
            t.stringLiteral(cssVariable(path.node.property.value))
          );
        } else if (
          path.node.computed &&
          path.get("object").isIdentifier({ name: "CSS_CLASSES" }) &&
          path.get("property").isStringLiteral()
        ) {
          path.replaceWith(
            t.stringLiteral(className(path.node.property.value))
          );
        }
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
        }
      },
      ImportDeclaration(path: any) {
        const assetPath = path.node.source.value;
        if (assetPath.startsWith("/assets")) {
          asyncTransform(async () => {
            const asset = await transformAsset(content, assetPath);
            path.node.source.value = asset;
          });
        }
      },
    });
  });

  let js = generate(ast).code;

  if (dev) {
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
