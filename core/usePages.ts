import minimatch from "minimatch";
import { createContext, useContext } from "react";
import { transformPage } from "./assetTransforms";
import useContent from "./useContent";
import castArray from "./util/castArray";

export type Page = {
  filename: string;
  url: string;
};

type PageData = {
  url: string;
  title: string;
  [key: string]: unknown;
};

export const PageContext = createContext<Page[]>([]);

type Options = {
  pages?: string[] | string;
};

export const useTableOfContents = (options: Options): PageData[] => {
  const content = useContent();
  const allPages = useContext(PageContext);
  const filter = castArray(options.pages);
  const pages =
    filter != null
      ? allPages.filter((page) =>
          filter.some((pattern) => minimatch(page.filename, pattern))
        )
      : allPages;

  let promises: Promise<any>[] | undefined;
  const out = pages.map(({ filename, url }) => {
    try {
      const { title, props } = transformPage(content, filename);
      return { title, ...props, url };
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
