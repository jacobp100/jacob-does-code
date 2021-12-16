import dev from "../util/dev";
import { Page, getPages } from "../util/projectPages";
import {
  renderPage,
  generateCssStats,
  resetCssStats,
  restartWorker,
  terminateWorker,
  clearAssetTransformCacheForFiles,
  encodeAssetTransformCache,
  restoreAssetTransformCache,
} from "./ipc";

export { restartWorker, terminateWorker };

const pageDependencies = new Map<Page, string[]>();

const pages = new Set(getPages());

// Number here is kind of random
// The expensive asset transforms happen in native code on another thread
// so the larger this number is, the more these transforms happen concurrently
// But there's also overhead from the extra bookkeeping React has to do
const concurrentLimit = dev ? 1 : 6;

export const buildPages = async (
  pages: Set<Page>,
  logger: (page: Page) => void
) => {
  const start = Date.now();

  const { default: pAll } = await eval(`import("p-all")`);
  await pAll(
    Array.from(pages, (page) => async () => {
      logger(page);
      const { dependencies } = await renderPage(page);

      pageDependencies.set(page, dependencies);
    }),
    { concurrency: concurrentLimit }
  );

  const end = Date.now();
  const duration = end - start;

  return { duration };
};

export const buildAllPages = async (logger: (page: Page) => void) => {
  resetCssStats();

  const { duration } = await buildPages(pages, logger);

  const cssStats = await generateCssStats();

  return { duration, cssStats };
};

export const clearCachesForFiles = async (
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

  const { jsModulesInvalidated } = await clearAssetTransformCacheForFiles(
    filenames
  );

  if (jsModulesInvalidated) {
    const assetTransformCache = await encodeAssetTransformCache();
    restartWorker();
    await restoreAssetTransformCache(assetTransformCache);
  }

  return { invalidatedPages };
};
