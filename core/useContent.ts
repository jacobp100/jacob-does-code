import fs from "fs";
import path from "path";
import { createContext, useContext } from "react";
// @ts-ignore
import stringHash from "string-hash";
import cache from "./cache";

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
      path.join(__dirname, "..", directory, `${filename}${extension}`)
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

export const layoutPath = cache<string, string>((filename) => {
  return modulePath("layouts", filename);
});

export const assetPath = (filename: string) => {
  if (!filename.startsWith("/assets/")) {
    throw new Error(`Expected ${filename} to start with /asset`);
  }
  return path.join(__dirname, `..${filename}`);
};

const sitePath = (filename: string) =>
  path.join(__dirname, "../site", filename);

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

  return {
    dependencies,
    component: (filename) =>
      require(addFilenameDependency(componentPath(filename))).default,
    layout: (filename) =>
      require(addFilenameDependency(layoutPath(filename))).default,
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
