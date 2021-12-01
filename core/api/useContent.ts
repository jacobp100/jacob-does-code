import * as fs from "fs";
import * as path from "path";
import { lazy, createContext, useContext } from "react";
// @ts-ignore
import glob from "glob";
// @ts-ignore
import stringHash from "string-hash";
import cache from "../util/cache.js";
import projectPath from "../util/projectPath.js";

type ReactComponent = (props: any) => JSX.Element;

export type Content = {
  dependencies: Set<string>;
  component: (filename: string) => ReactComponent;
  layout: (filename: string) => ReactComponent;
  page: (filename: string) => string;
  asset: (filename: string) => string;
  assetBuffer: (filename: string) => Buffer;
  write: (
    content: Buffer | string,
    options: { filename?: string; extension: string }
  ) => string;
};

const modulePath = (directory: string, filename: string) => {
  const output = [".js", ".jsx", ".ts", ".tsx"]
    .map((extension) =>
      path.join(projectPath, directory, `${filename}${extension}`)
    )
    .find((candidate) => fs.existsSync(candidate));

  if (output == null) {
    throw new Error(`Failed to find file ${filename} in ${directory}`);
  }

  return output;
};

export const componentPath = cache<string, string>((filename) => {
  return modulePath("components", filename);
});

const componentNames: string[] = glob
  .sync(path.join(projectPath, "components/*.{js,jsx,ts,tsx}"))
  .map((filename: string) => path.basename(filename, path.extname(filename)));
export const getComponentNames = () => componentNames;

export const layoutPath = cache<string, string>((filename) => {
  return modulePath("layouts", filename);
});

export const assetPath = (filename: string) => {
  if (!filename.startsWith("/assets/")) {
    throw new Error(`Expected ${filename} to start with /asset`);
  }
  return path.join(projectPath, filename);
};

const sitePath = (filename: string) => path.join(projectPath, "site", filename);

const contentHash = (content: Buffer | string) =>
  typeof content === "string"
    ? stringHash(content).toString(16)
    : stringHash(content.toString("hex")).toString(16);

const write = (
  content: Buffer | string,
  { filename, extension }: { filename?: string; extension: string }
) => {
  const basename = filename != null ? filename : `res/${contentHash(content)}`;
  const outputFilename = basename + extension;

  if (outputFilename.includes("/")) {
    const dir = sitePath(path.join(outputFilename, ".."));
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(sitePath(outputFilename), content);

  const outputHref = `/${outputFilename}`;

  return outputHref;
};

export const createContentContext = (): Content => {
  const dependencies = new Set<string>();

  const addFilenameDependency = (filename: string) => {
    dependencies.add(filename);
    return filename;
  };

  const importComponent = (filename: string) => {
    dependencies.add(filename);
    const moduleFilename =
      filename.slice(0, -path.extname(filename).length) + ".js";
    const Component = lazy(() => import(moduleFilename));
    return Component as ReactComponent;
  };

  return {
    dependencies,
    component: (filename) => importComponent(componentPath(filename)),
    layout: (filename) => importComponent(layoutPath(filename)),
    page: (filename) =>
      fs.readFileSync(addFilenameDependency(filename), "utf8"),
    asset: (filename) =>
      fs.readFileSync(addFilenameDependency(assetPath(filename)), "utf8"),
    assetBuffer: (filename) =>
      fs.readFileSync(addFilenameDependency(assetPath(filename))),
    write: (content, options) => write(content, options),
  };
};

export const ContentContext = createContext<Content>(null!);

export default () => useContext(ContentContext);
