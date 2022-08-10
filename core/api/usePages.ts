import { createContext, useContext } from "react";
import useContent, { Content } from "./useContent";
import evalPage from "./util/evalPage";

export type Page = {
  filename: string;
  url: string;
};

type PageData = {
  url: string;
  title: string;
};

export const PageContext = createContext<Page[]>([]);

const evalPages = (content: Content, pages: Page[]): PageData[] => {
  let promises: Promise<any>[] = [];

  const out = pages.map(({ filename, url }) => {
    try {
      const { title } = evalPage(content, filename);
      return { url, title };
    } catch (e) {
      if (e instanceof Promise) {
        promises.push(e);
        return undefined as any;
      } else {
        throw e;
      }
    }
  });

  if (promises.length === 0) {
    return out;
  } else {
    throw Promise.all(promises);
  }
};

export const usePages = () => useContext(PageContext);
export const usePagesData = (pages: Page[]) => evalPages(useContent(), pages);
