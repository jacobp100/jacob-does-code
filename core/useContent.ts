import fs from "fs";
import path from "path";
import { createContext, useContext } from "react";
// @ts-ignore
import stringHash from "string-hash";
import cache from "./cache";

type Global = {
  assetCached: (filename: string) => string;
  assetBufferCached: (filename: string) => Buffer;
};

export const createGlobalContext = (): Global => ({
  assetCached: cache<string, string>((filename) => {
    return fs.readFileSync(filename, "utf8");
  }),
  assetBufferCached: cache<string, Buffer>((filename) => {
    return fs.readFileSync(filename);
  }),
});

export const defaultGlobalContext = createGlobalContext();

export type Content = {
  dependencies: Set<string>;
  component: (filename: string) => ReactComponent;
  layout: (filename: string) => ReactComponent;
  page: (filename: string) => string;
  asset: (filename: string) => string;
  assetBuffer: (filename: string) => Buffer;
};

const modulePath = (directory: string, filename: string) => {
  const output = [".js", ".jsx", ".ts", ".tsx"]
    .map((extension) =>
      path.join(__dirname, "..", directory, `${filename}${extension}`)
    )
    .find((candidate) => fs.existsSync(candidate));

  if (output == null) {
    throw new Error(`Failed to find file ${filename} in ${directory}`);
  }

  return output;
};

const componentPath = cache<string, string>((filename) => {
  return modulePath("components", filename);
});

const layoutPath = cache<string, string>((filename) => {
  return modulePath("layouts", filename);
});

const assetPath = (filename: string) => {
  if (!filename.startsWith("/assets/")) {
    throw new Error(`Expected ${filename} to start with /asset`);
  }
  return path.join(__dirname, `..${filename}`);
};

export const createContentContext = (
  globalContext = defaultGlobalContext
): Content => {
  const { assetCached, assetBufferCached } = globalContext;
  const dependencies = new Set<string>();

  const addFilenameDependency = (filename: string) => {
    dependencies.add(filename);
    return filename;
  };

  return {
    dependencies,
    component: (filename) => require(componentPath(filename)).default,
    layout: (filename) => require(layoutPath(filename)).default,
    page: (filename) => assetCached(addFilenameDependency(filename)),
    asset: (filename) =>
      assetCached(addFilenameDependency(assetPath(filename))),
    assetBuffer: (filename) =>
      assetBufferCached(addFilenameDependency(assetPath(filename))),
  };
};

export const ContentContext = createContext<Content>(null!);

type ReactComponent = (props: any) => JSX.Element;

export default () => useContext(ContentContext);

const sitePath = (filename: string) =>
  path.join(__dirname, "../site", filename);
export const writeSiteAsset = (
  content: Buffer | string,
  { filename = "", extension }: { filename?: string; extension: string }
) => {
  const outputFilename = [
    filename.length > 0
      ? filename
      : typeof content === "string"
      ? stringHash(content).toString(16)
      : stringHash(content.toString("hex")).toString(16),
    extension,
  ].join("");

  if (filename.includes("/")) {
    const dir = sitePath(path.join(outputFilename, ".."));
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(sitePath(outputFilename), content);

  const outputHref = `/${outputFilename}`;

  return outputHref;
};
