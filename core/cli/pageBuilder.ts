import type { Page } from "../usePages";
import allPages from "./allPages";
import type { API } from "./api-direct";

const pageDependencies = new Map<Page, string[]>();

export const buildPages = async (
  api: API,
  pages: Set<Page>,
  concurrentLimit: number,
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

export const buildAllPages = async (
  api: API,
  concurrentLimit: number,
  logger: (page: Page) => void
) => {
  api.resetCssStats();

  const { duration } = await buildPages(api, allPages, concurrentLimit, logger);

  const cssStats = await api.generateCssStats();

  return { duration, cssStats };
};

export const clearCachesForFiles = async (
  api: API,
  filenames: string[]
): Promise<{ invalidatedPages: Set<Page>; jsModulesInvalidated: boolean }> => {
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

  const { jsModulesInvalidated } = await api.clearAssetTransformCacheForFiles(
    filenames
  );

  return { invalidatedPages, jsModulesInvalidated };
};
