import * as fs from "fs";
import type Module from "module";
import * as path from "path";
import { cwd } from "process";
import { createContext, useContext } from "react";
import stringHash from "string-hash";

const libraryPath = path.join(__dirname);

const projectPath = cwd();

export type Content = {
  dependencies: Set<string>;
  require: (module: string) => any;
  read: (filename: string) => string;
  readBuffer: (filename: string) => Buffer;
  write: (
    content: Buffer | string,
    options: { filename?: string; extension: string }
  ) => string;
};

const relativePath = (filename: string) => {
  if (!filename.startsWith("/")) {
    throw new Error(`Content filename "${filename}" should start with "/"`);
  }
  return path.resolve(projectPath, filename.slice(1));
};

const sitePath = path.join(projectPath, "site");

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

  const dir = path.dirname(outputFilename);
  if (dir !== ".") {
    fs.mkdirSync(path.join(sitePath, dir), { recursive: true });
  }

  fs.writeFileSync(path.join(sitePath, outputFilename), content);

  const outputHref = `/${outputFilename}`;

  return outputHref;
};

export const createContentContext = (): Content => {
  const dependencies = new Set<string>();

  const addFilenameDependency = (filename: string) => {
    dependencies.add(filename);
    return filename;
  };

  const requrieImpl = (filename: string) => {
    const modulePathAbsolute = require.resolve(filename);
    const module = require(modulePathAbsolute);

    const addModuleDependencies = ({ filename, children }: Module) => {
      if (
        !filename.includes("node_modules") &&
        !filename.startsWith(libraryPath)
      ) {
        dependencies.add(filename);
        children.forEach(addModuleDependencies);
      }
    };
    addModuleDependencies(require.cache[modulePathAbsolute]!);

    return module;
  };

  return {
    dependencies,
    require: requrieImpl,
    read: (filename) =>
      fs.readFileSync(addFilenameDependency(relativePath(filename)), "utf8"),
    readBuffer: (filename) =>
      fs.readFileSync(addFilenameDependency(relativePath(filename))),
    write: (content, options) => write(content, options),
  };
};

export const ContentContext = createContext<Content>(null!);

export default () => useContext(ContentContext);
