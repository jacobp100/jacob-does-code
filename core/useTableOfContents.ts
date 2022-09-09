import minimatch from "minimatch";
import transformPage from "./transformPage";
import { Page, useConfig } from "./config";
import useContent from "./useContent";
import castArray from "./util/castArray";

export type PageData = {
  filename: string;
  url: string;
  [key: string]: unknown;
};

type Options = {
  pages?: string[] | string;
};

export const usePages = (options?: Options): Page[] => {
  let { pages } = useConfig();
  if (options?.pages != null) {
    const filter = castArray(options.pages);
    pages = pages.filter((page) =>
      filter.some((pattern) => minimatch(page.filename, pattern))
    );
  }

  return pages;
};

export const useTableOfContents = (options?: Options): PageData[] => {
  const content = useContent();
  const pages = usePages(options);

  let promises: Promise<any>[] | undefined;
  const out = pages.map(({ filename, url }) => {
    try {
      const { props } = transformPage(content, filename);
      return { ...props, filename, url };
    } catch (e) {
      if (!(e instanceof Promise)) {
        throw e;
      }

      if (promises == null) {
        promises = [e];
      } else {
        promises.push(e);
      }

      return undefined as any;
    }
  });

  if (promises != null) {
    throw Promise.all(promises);
  } else {
    return out;
  }
};
