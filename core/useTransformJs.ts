import { parse } from "@babel/parser";
// @ts-ignore
import traverse from "@babel/traverse";
// @ts-ignore
import generate from "@babel/generator";
import * as t from "@babel/types";
import { minify } from "terser";
import useTransformAsset from "./useTransformAsset";
import { variable, className } from "./css";
import { syncPromiseValue } from "./syncPromise";
import dev from "./dev";

export default (input: string) => {
  const transformAsset = useTransformAsset();

  const ast = parse(input, {
    sourceType: "module",
  });

  traverse(ast, {
    MemberExpression(path: any) {
      if (
        path.node.computed &&
        path.get("object").isIdentifier({ name: "CSS_VARS" }) &&
        path.get("property").isStringLiteral()
      ) {
        path.replaceWith(t.stringLiteral(variable(path.node.property.value)));
      } else if (
        path.node.computed &&
        path.get("object").isIdentifier({ name: "CSS_CLASSES" }) &&
        path.get("property").isStringLiteral()
      ) {
        path.replaceWith(t.stringLiteral(className(path.node.property.value)));
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
        path.replaceWith(t.stringLiteral(transformAsset(argument.node.value)));
      } else if (callee.isImport()) {
        argument.node.value = transformAsset(argument.node.value);
      }
    },
    ImportDeclaration(path: any) {
      const asset = path.node.source.value;
      if (asset.startsWith("/assets")) {
        path.node.source.value = transformAsset(asset);
      }
    },
  });

  let js = generate(ast).code;

  if (dev) {
    return js;
  }

  const { code } = syncPromiseValue(minify(js));

  if (code == null) {
    throw new Error("Unknown error");
  }

  js = code;

  return js;
};
