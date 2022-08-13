import type { Page } from "../usePages";
import allPages from "./allPages";
import type { API } from "./api-direct";

const pageDependencies = new Map<Page, string[]>();

// Number here is kind of random
// The expensive asset transforms happen in native code on another thread
// so the larger this number is, the more these transforms happen concurrently
// But there's also overhead from the extra bookkeeping React has to do
const concurrentLimit = process.env.NODE_ENV === "development" ? 1 : 6;

export const buildPages = async (
  api: API,
  pages: Set<Page>,
  logger: (page: Page) => void
) => {
  const start = Date.now();

  // Preserve imports to work with node imports
  const { default: pAll } = await eval(`import("p-all")`);
  const pagesArray = Array.from(allPages);

  await pAll(
    Array.from(pages, (page) => async () => {
      logger(page);

      const { dependencies } = await api.renderPage({
        page,
        pages: pagesArray,
      });

      pageDependencies.set(page, dependencies);
    }),
    { concurrency: concurrentLimit }
  );

  const end = Date.now();
  const duration = end - start;

  return { duration };
};

export const buildAllPages = async (api: API, logger: (page: Page) => void) => {
  api.resetCssStats();

  const { duration } = await buildPages(api, allPages, logger);

  const cssStats = await api.generateCssStats();

  return { duration, cssStats };
};

export const clearCachesForFiles = async (
  _api: API,
  filenames: string[]
): Promise<{ invalidatedPages: Set<Page> }> => {
  const invertedPageDependencies = new Map<string, Set<Page>>();
  pageDependencies.forEach((dependencies, page) => {
    dependencies.forEach((dependency) => {
      let pages = invertedPageDependencies.get(dependency);
      if (pages == null) {
        pages = new Set<Page>();
        invertedPageDependencies.set(dependency, pages);
      }
      pages.add(page);
    });
  });

  const invalidatedPages = new Set<Page>();
  filenames.forEach((filename) => {
    invertedPageDependencies.get(filename)?.forEach((page) => {
      invalidatedPages.add(page);
    });
  });

  return { invalidatedPages };
};
