import path from "path";
import { cwd } from "process";
import { createContext, useContext } from "react";
import { Content } from "./useContent";

export const projectPath = cwd();

export type Page = {
  filename: string;
  url: string;
};

export type Config = {
  pages?: string[] | string;
  urlForPage?: (filename: string) => string;
  Layout?: (props: any) => JSX.Element;
};

export type ResolvedConfig = {
  pages: Page[];
  urlForPage?: (filename: string) => string;
  Layout?: (props: any) => JSX.Element;
};

export const ConfigContext = createContext<ResolvedConfig>({ pages: [] });

export const getConfig = (content: Pick<Content, "require">): Config => {
  const config: Config | null = [
    ".config.tsx",
    ".config.ts",
    ".config.js",
  ].reduce<Config | null>((config, ext) => {
    if (config != null) {
      return config;
    }

    try {
      const module: any = content.require(path.join(projectPath, `site${ext}`));
      return module.default ?? module;
    } catch {
      return null;
    }
  }, null);

  return config ?? { pages: ["**/*.mdx"] };
};

export const useConfig = () => useContext(ConfigContext);
