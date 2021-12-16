import { Page, getPages } from "../util/projectPages";
import evalPage from "./util/evalPage";
import useContent, { Content } from "./useContent";

type PageData = {
  url: string;
  title: string;
};

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

export const usePages = () => getPages(); // TODO: Handle page creation/removal
export const usePagesData = (pages: Page[]) => evalPages(useContent(), pages);
